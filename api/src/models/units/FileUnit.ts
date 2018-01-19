import * as mongoose from 'mongoose';
import {Unit} from './Unit';
import {IFileUnit} from '../../../../shared/models/units/IFileUnit';
import fs = require('fs');
import {InternalServerError} from 'routing-controllers';
import {Lecture} from '../Lecture';
import {IFile} from '../../../../shared/models/IFile';
import {NativeError} from 'mongoose';
import {File} from '../mediaManager/File';

interface IFileUnitModel extends IFileUnit, mongoose.Document {
  exportJSON: () => Promise<IFileUnit>;
}

const fileUnitSchema = new mongoose.Schema({
  files: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'File'
    }
  ],
  fileUnitType: {
    type: String,
    required: true
  }
}, {
  toObject: {
    transform: function (doc: any, ret: any) {
      if (ret.hasOwnProperty('_id') && ret !== null) {
        ret._id = ret._id.toString();
      }

      if (ret.hasOwnProperty('id') && ret !== null) {
        ret.id = ret.id.toString();
      }

      ret.files = ret.files.map((file: any) => {
        file._id = file._id.toString();
        return file;
      });
      ret._course = ret._course.toString();
    }
  },
});

// Cascade delete
fileUnitSchema.pre('remove', function(next: () => void) {
  (<IFileUnitModel>this).files.forEach((file: any) => {
    fs.unlink(file.path, () => {}); // silently discard file not found errors
  });
  next();
});

fileUnitSchema.post('init', async function (doc: IFileUnitModel, next: (err?: NativeError) => void) {
  const localDoc = doc;
  next();
});

// const FileUnit = Unit.discriminator('file', fileUnitSchema);

export {fileUnitSchema, IFileUnitModel}
