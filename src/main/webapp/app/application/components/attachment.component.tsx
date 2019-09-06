import React, { FunctionComponent } from 'react';
import { Avatar, Divider, Icon } from 'antd';
import mime from 'mime-types';

interface IAttachmentComponentProps {
  fileName: string;
  file: any;
  contentType: string;
}

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

const mimeTypeToIcon = (mime_type: string) => {
  const icons = {
    image: 'file-image',
    audio: 'audio',
    video: 'video-camera',
    'application/pdf': 'file-pdf',
    'application/msword': 'file-word',
    'application/vnd.ms-word': 'file-word',
    'application/vnd.oasis.opendocument.text': 'file-word',
    'application/vnd.openxmlformats-officedocument.wordprocessingml': 'file-word',
    'application/vnd.ms-excel': 'file-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml': 'file-excel',
    'application/vnd.oasis.opendocument.spreadsheet': 'file-excel',
    'application/vnd.ms-powerpoint': 'file-ppt',
    'application/vnd.openxmlformats-officedocument.presentationml': 'file-ppt',
    'application/vnd.oasis.opendocument.presentation': 'file-ppt',
    'text/plain': 'file-text',
    'text/html': 'file-text',
    'application/json': 'file-text',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'file-word',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'file-excel',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'file-ppt',
    'application/gzip': 'file-zip',
    'application/zip': 'file-zip',
    'application/x-zip-compressed': 'file-zip',
    'application/octet-stream': 'file-zip'
  };
  if (!!icons[mime_type]) {
    return icons[mime_type];
  }
  const mime_group = mime_type.split('/', 2)[0];
  return !!icons[mime_group] ? icons[mime_group] : 'file-unknown';
};

export const Attachment: FunctionComponent<IAttachmentComponentProps> = props => {
  const { fileName, file, contentType } = props;
  if (!file) {
    return null;
  }
  const blobFile = new Blob([base64ToBytes(file)], { type: contentType });
  const fileSize = getFileSize(blobFile.size);
  const extension = mime.extension(contentType);
  const icon = mimeTypeToIcon(contentType);

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
    <div className="attach-file">
      <div className="attach-file-meta">
        <Avatar size="default" shape="square" className={`ant-avatar-${icon}`}>
          <Icon type={icon} theme="filled" />
        </Avatar>
        <div className="attach-file-content">
          <h4 className="attach-file-title">{fileName}</h4>
          <div className="attach-file-description">
            <span>TAILLE</span> {fileSize} <Divider type="vertical" /> <span>TYPE</span> {extension}
          </div>
        </div>
      </div>
      <a onClick={handleDownload}>
        <Icon type="download" />
        <small>Télécharger</small>
      </a>
    </div>
  );
};
