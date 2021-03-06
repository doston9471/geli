import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {IUser} from '../../../../../../../../shared/models/IUser';
import {DialogService} from '../../../../shared/services/dialog.service';
import {MatSnackBar} from '@angular/material';
import {CourseService} from '../../../../shared/services/data.service';
import {ICourse} from '../../../../../../../../shared/models/ICourse';

@Component({
  selector: 'app-course-user-list-overview',
  templateUrl: './course-user-list-overview.component.html',
  styleUrls: ['./course-user-list-overview.component.scss']
})
export class CourseUserListOverviewComponent implements OnInit {

  @Input() course: ICourse;
  @Input() role: string;
  @Input() usersInCourse: IUser[];
  @Input() show: boolean;
  @Output() onRemove = new EventEmitter<String>();

  selectedMembers: IUser[] = [];
  toggleBlocked = false;
  selectedAll = false;

  static getMailAddressStringForUsers(users: IUser[]) {
    return users.map((user: IUser) => `${user.profile.firstName} ${user.profile.lastName}<${user.email}>`).join(', ');
  }

  constructor(private dialogService: DialogService, private snackBar: MatSnackBar,
              private courseService: CourseService) {
  }

  ngOnInit() {
  }

  toggleMember(member: IUser) {
    if (this.toggleBlocked) {
      return;
    }
    this.selectedAll = false;
    const position = this.selectedMembers.indexOf(member);
    if (position !== -1) {
      this.selectedMembers.splice(position, 1);
    } else {
      this.selectedMembers.push(member);
    }
  }

  isInSelectedMembers(member: IUser) {
    return this.selectedMembers.indexOf(member) !== -1;
  }

  async removeSelectedUsers() {
    this.toggleBlocked = true;
    const res = await this.dialogService
      .confirmRemove('selected members', '', 'course')
      .toPromise();
    this.toggleBlocked = false;
    if (res) {
      this.selectedMembers.forEach(user => this.onRemove.emit(user._id));
      this.resetSelectedUsers();
    }
  }

  async openWriteMailDialog() {
    this.toggleBlocked = true;
    const mailData = await this.dialogService.writeMail({
      bcc: CourseUserListOverviewComponent.getMailAddressStringForUsers(this.selectedMembers),
      cc: CourseUserListOverviewComponent.getMailAddressStringForUsers(this.course.teachers),
      markdown: `\n\n\n---\nYou received this mail because you are a ${this.role} in the course ${this.course.name}.`,
      subject: `${this.course.name}: `,
    }).toPromise();
    this.toggleBlocked = false;
    if (!mailData) {
      return;
    }
    this.resetSelectedUsers();
    try {
      await this.courseService.sendMailToSelectedUsers(mailData);
      this.snackBar.open('Sending mail succeeded.', '', {duration: 2000});
    } catch (err) {
      this.snackBar.open('Sending mail failed.', '', {duration: 3000});
    }
  }

  toggleAllUsers() {
    if (this.selectedAll) {
      this.resetSelectedUsers();
    } else {
      this.selectedMembers = this.usersInCourse.map(user => user); // new array but values by ref
      this.selectedAll = true;
    }
  }

  resetSelectedUsers() {
    this.selectedMembers = [];
    this.selectedAll = false;
  }
}
