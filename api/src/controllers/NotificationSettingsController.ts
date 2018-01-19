import {BadRequestError, Body, Get, JsonController, Param, Post, Put, UseBefore} from 'routing-controllers';
import passportJwtMiddleware from '../security/passportJwtMiddleware';
import {INotificationSettingsModel, NotificationSettings} from '../models/NotificationSettings';
import {INotificationSettings} from '../../../shared/models/INotificationSettings';

@JsonController('/notificationSettings')
@UseBefore(passportJwtMiddleware)
export class NotificationSettingsController {

  @Get('/user/:id')
  async getNotificationSettingsPerUser(@Param('id') id: string) {
    const notificationSettings: INotificationSettingsModel[] = await NotificationSettings.find({'user': id})
      .populate('user')
      .populate('course');
    return notificationSettings.map(settings => {return settings.toObject()});
  }

  @Put('/:id')
  async updateNotificationSettings(@Param('id') id: string, @Body() notificationSettings: INotificationSettings) {
    if (!notificationSettings) {
      throw new BadRequestError('notification needs fields course and user')
    }
    const settings: INotificationSettingsModel = await NotificationSettings.findOneAndUpdate({'_id': id}, notificationSettings, {new: true})
    return settings.toObject();
  }

  @Post('/')
  async createNotificationSettings(@Body() data: any) {
      if (!data.userId || !data.courseId || !data.notificationType) {
        throw new BadRequestError('NotificationSettings need courseId, userId and notificationType');
      }
      const notificationSettings: INotificationSettingsModel =
        await NotificationSettings.findOne({'user': data.userId, 'course': data.courseId});
      if (notificationSettings) {
        throw new BadRequestError('NotificationSettings for user:' + data.userId + ' with course: ' + data.courseId + ' already exist');
      }
      const settings: INotificationSettingsModel =
        await new NotificationSettings({'user': data.userId, 'course': data.courseId, 'notificationType': data.notificationType}).save()
      return settings.toObject();
    }


}