import {Component, OnInit, Input} from '@angular/core';
import {UserService} from '../shared/services/user.service';
import {ICourse} from '../../../../../shared/models/ICourse';
import {ILecture} from '../../../../../shared/models/ILecture';
import {ExpandableDivHeaderTags} from '../shared/components/expandable-div/expandable-div-header-tags.enum';

@Component({
  selector: 'app-lecture',
  templateUrl: './lecture.component.html',
  styleUrls: ['./lecture.component.scss']
})
export class LectureComponent implements OnInit {

  @Input() course: ICourse;
  @Input() lecture: ILecture;
  opened: boolean;
  private headerTags = ExpandableDivHeaderTags;

  constructor(public userService: UserService) {
    this.opened = true;
  }

  ngOnInit() {
  }

  toggleOpen() {
    this.opened = !this.opened;
  }
}
