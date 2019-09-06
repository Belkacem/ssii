import React, { Component, ReactElement, RefObject } from 'react';
import { Skeleton } from 'antd';
import './printable.scss';

export function printHtml(html, loadStyle = true) {
  if (document.getElementById('printable-iframe')) {
    document.getElementById('printable-iframe').remove();
  }
  const printWindow = document.createElement('iframe');
  printWindow.id = 'printable-iframe';
  printWindow.style.position = 'absolute';
  printWindow.style.top = '-1000px';
  printWindow.style.left = '-1000px';
  const launchPrint = () => {
    printWindow.contentWindow.focus();
    printWindow.contentWindow.print();
    if (document.getElementById('printable-iframe')) {
      document.getElementById('printable-iframe').remove();
    }
  };
  printWindow.onload = () => {
    const domDoc = printWindow.contentDocument || printWindow.contentWindow.document;
    domDoc.open();
    if (loadStyle) {
      const css_url = 'content/css/printable.css';
      domDoc.write(`${html}<link rel="stylesheet" href="${css_url}">`);
    } else {
      domDoc.write(html);
    }
    domDoc.close();
    if (loadStyle) {
      domDoc.addEventListener('DOMContentLoaded', launchPrint);
    }
  };
  document.body.appendChild(printWindow);
  if (!loadStyle) {
    launchPrint();
  }
}

interface IPrintableProps {
  size?: 'A5' | 'A4' | 'Letter' | 'Legal';
  orientation?: 'landscape' | 'portrait';
  margin?: string;
  loading?: boolean;
  showPagination?: boolean;
  loadStyle?: boolean;
}

export class Printable extends Component<IPrintableProps> {
  wrapperRef: RefObject<HTMLDivElement>;
  pagesRef: RefObject<HTMLDivElement>;
  scaleWrapperCount: number;
  pagesCount: number;

  constructor(props) {
    super(props);
    this.wrapperRef = React.createRef<HTMLDivElement>();
    this.pagesRef = React.createRef<HTMLDivElement>();
    this.scaleWrapperCount = 0;
    this.pagesCount = 0;
    this.printPageFunction = this.printPageFunction.bind(this);
  }

  componentDidMount() {
    window.addEventListener('resize', this.scaleWrapper);
    window.addEventListener('keydown', this.printPageFunction, false);
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.scaleWrapper);
    window.removeEventListener('keydown', this.printPageFunction, false);
  }

  componentDidUpdate(prevProps) {
    if (prevProps.children !== this.props.children) {
      this.pagesCount = React.Children.count(this.props.children);
      this.scaleWrapperCount = 0;
    }
  }

  printPageFunction(event) {
    if (event.keyCode === 80 && event.ctrlKey) {
      this.print();
      event.preventDefault();
      return false;
    }
  }

  scaleWrapper = () => {
    if (!this.wrapperRef.current || !this.pagesRef.current) {
      return false;
    }
    const outer_width = this.wrapperRef.current.clientWidth - 32;
    const inner_width = this.pagesRef.current.clientWidth;
    const inner_height = this.pagesRef.current.clientHeight;
    if (outer_width < inner_width) {
      const scale = outer_width / inner_width;
      const padding = outer_width - inner_width * scale;
      const x = padding / 2;
      this.pagesRef.current.style.transformOrigin = x.toFixed(2) + 'px 0px 0px';
      this.pagesRef.current.style.transform = 'scale(' + scale.toFixed(2) + ')';
      this.wrapperRef.current.style.height = (inner_height - 16 * (this.pagesCount - 1)) * scale + 32 + 'px';
      this.wrapperRef.current.style.overflow = 'hidden';
    } else {
      this.pagesRef.current.style.transformOrigin = 'none';
      this.pagesRef.current.style.transform = 'none';
      this.wrapperRef.current.setAttribute('style', '');
    }
    this.scaleWrapperCount++;
  };

  public print = () => {
    const { loadStyle = true } = this.props;
    printHtml(this.pagesRef.current.innerHTML, loadStyle);
  };

  render() {
    const { loading, size = 'A4', orientation = 'portrait', margin = '0.5cm', showPagination = false } = this.props;
    if (this.scaleWrapperCount < 2 && this.pagesCount > 0) {
      this.scaleWrapper();
    }
    return (
      <div className="page-wrapper" ref={this.wrapperRef}>
        <div className="pages" ref={this.pagesRef}>
          {React.Children.map(this.props.children, (child, index) => (
            <div className={`page ${size} ${orientation}`} style={{ padding: margin }}>
              {loading ? <Skeleton /> : child}
              {showPagination && <div className="pagination">{`${index + 1} / ${this.pagesCount}`}</div>}
            </div>
          ))}
        </div>
      </div>
    );
  }
}
