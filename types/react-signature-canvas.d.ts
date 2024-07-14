// types/react-signature-canvas.d.ts
declare module 'react-signature-canvas' {
    import { Component, RefObject } from 'react';
  
    interface SignatureCanvasProps {
      canvasProps?: object;
      clearOnResize?: boolean;
      backgroundColor?: string;
      penColor?: string;
      dotSize?: number | (() => number);
      minWidth?: number;
      maxWidth?: number;
      throttle?: number;
      minDistance?: number;
      velocityFilterWeight?: number;
      onEnd?: (event: MouseEvent | TouchEvent) => void;
      onBegin?: (event: MouseEvent | TouchEvent) => void;
    }
  
    export default class SignatureCanvas extends Component<SignatureCanvasProps> {
      clear: () => void;
      isEmpty: () => boolean;
      fromDataURL: (dataURL: string, options?: object) => void;
      toDataURL: (type?: string, encoderOptions?: number) => string;
      fromData: (pointGroups: object[]) => void;
      toData: () => object[];
    }
  }
  