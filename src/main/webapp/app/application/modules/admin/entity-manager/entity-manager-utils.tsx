import React, { useEffect, useState } from 'react';
import moment from 'moment';
import { FORMAT_DATE_SERVER, FORMAT_DATETIME, FORMAT_DATETIME_SERVER } from 'app/application/common/config/constants';
import { DateFormat } from 'app/application/components/date.format.component';
import mime from 'mime-types';

export const getQueryStringParams = query =>
  query
    ? (/^[?#]/.test(query) ? query.slice(1) : query).split('&').reduce((params, param) => {
        const [key, value] = param.split('=');
        params[key] = value ? decodeURIComponent(value.replace(/\+/g, ' ')) : '';
        return params;
      }, {})
    : {};

const getType = (key: string, value: any, keys: string[]) => {
  const type = typeof value;
  if (type === 'string') {
    if (keys.indexOf(`${key}ContentType`) !== -1) {
      return 'file';
    }
    if (moment(value, FORMAT_DATE_SERVER, true).isValid()) {
      return 'date';
    }
    if (moment(value, FORMAT_DATETIME_SERVER, true).isValid()) {
      return 'datetime';
    }
  }
  return type;
};

export const getFields = (data: any[]) => {
  if (data.length === 0) return [];
  const keys = Object.keys(data[0]);
  return keys.map(key => {
    const entity = data.find(e => !!e[key]);
    return {
      name: key,
      type: getType(key, !!entity ? entity[key] : '', keys),
      required: !data.some(e => !e[key]),
      nullable: data.some(e => e[key] === null)
    };
  });
};

const renderDate = (value: string) => <DateFormat value={value} />;

const renderDateTime = (value: string) => <DateFormat value={value} format={FORMAT_DATETIME} />;

const getFileSize = size => {
  const i = Math.floor(Math.log(size) / Math.log(1024));
  const unit = ['B', 'kB', 'MB', 'GB', 'TB'][i];
  return (size / Math.pow(1024, i)).toFixed(2) + ' ' + unit;
};

const base64ToBytes = b64Data => {
  const byteCharacters = atob(b64Data);
  const byteNumbers = new Array(byteCharacters.length);
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  return new Uint8Array(byteNumbers);
};

const renderFile = (file: string, contentType: string) => {
  if (!file) {
    return null;
  }
  const blobFile = new Blob([base64ToBytes(file)], { type: contentType });
  const fileSize = getFileSize(blobFile.size);
  const extension = mime.extension(contentType);
  const fileName = `file_${new Date().getTime()}.${extension}`;
  const handleDownload = () => {
    const link = document.createElement('a');
    link.setAttribute('target', '_blank');
    if (!!blobFile) {
      link.setAttribute('href', URL.createObjectURL(blobFile));
    } else {
      link.setAttribute('href', `data:${contentType};base64,${file}`);
    }
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <a onClick={handleDownload} title="cliquez pour télécharger">
      Taille: {fileSize}, Type: {extension}
    </a>
  );
};

export const renderFieldData = (fieldName: string, fieldType, value: any, entity: any) => {
  if (!!value) {
    if (fieldType === 'date') {
      return renderDate(value);
    }
    if (fieldType === 'datetime') {
      return renderDateTime(value);
    }
    if (fieldType === 'file') {
      return renderFile(value, entity[`${fieldName}ContentType`]);
    }
    if (fieldType === 'object') {
      return JSON.stringify(value);
    }
    return value.toString();
  }
  return '';
};

export const renderSmallFieldData = (fieldName: string, fieldType, value: any, entity: any) => (
  <small>{renderFieldData(fieldName, fieldType, value, entity)}</small>
);
