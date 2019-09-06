import React from 'react';
import { Icon, Spin } from 'antd';

export const ZSoftLogoSvg = ({ width, height, title, className }) => (
  <svg width={width} height={height} className={className} viewBox="0 0 272 362" xmlns="http://www.w3.org/2000/svg">
    <title>{title}</title>
    <polygon
      fill="currentColor"
      points="28.934295654296875,0 272.87158203125,0 143.29257202148438,
                    225.9610595703125 163.27059936523438,97.82489013671875 28.934295654296875,97.13565063476562 "
    />
    <polygon
      fill="currentColor"
      points="243.93728637695312,362.44000244140625 0,362.44000244140625 129.57962036132812,
                    136.47940063476562 109.60098266601562,264.61572265625 243.93728637695312, 265.30438232421875 "
    />
  </svg>
);

export const LoadingSvg = <Icon type="loading" style={{ fontSize: 24 }} spin />;

export const LoadingDiv = () => <Spin className="loading-content fullwidth transparent" />;
