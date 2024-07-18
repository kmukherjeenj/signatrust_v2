/*import React, { useRef, useState, useCallback } from 'react';
import SignatureCanvas from 'react-signature-canvas';
//import { useFarcaster } from '../../hooks/useFarcaster';

interface SignaturePadProps {
  onComplete: (signatureData: string) => void;
  signatureRequestId: string;
}

const SignaturePad: React.FC<SignaturePadProps> = ({ onComplete, signatureRequestId }) => {
  const sigCanvas = useRef<SignatureCanvas>(null);
  const [isEmpty, setIsEmpty] = useState(true);
  //const { signWithFarcaster } = useFarcaster();

  const handleClear = useCallback(() => {
    sigCanvas.current?.clear();
    setIsEmpty(true);
  }, []);

  const handleSave = useCallback(async () => {
    if (sigCanvas.current && !sigCanvas.current.isEmpty()) {
      const signatureData = sigCanvas.current.toDataURL();
      /*try {
        await signWithFarcaster(signatureRequestId, signatureData);
        onComplete(signatureData);
      } catch (error) {
        console.error('Error signing document:', error);
        // Handle error (e.g., show error message to user)
      }
    } else {
      alert('Please provide a signature before saving.');
    }
  }, [signatureRequestId, signWithFarcaster, onComplete]);

  const handleBegin = useCallback(() => setIsEmpty(false), []);

  const handleEnd = useCallback(() => {
    if (sigCanvas.current?.isEmpty()) {
      setIsEmpty(true);
    }
  }, []);

  return (
    <div className="signature-pad">
      <SignatureCanvas
        ref={sigCanvas}
        onBegin={handleBegin}
        onEnd={handleEnd}
        canvasProps={{
          className: 'signature-canvas',
          width: 500,
          height: 200,
        }}
      />
      <div className="signature-pad-controls">
        <button 
          onClick={handleClear}
          className="clear-button"
          aria-label="Clear signature"
        >
          Clear
        </button>
        <button 
          onClick={handleSave}
          className="save-button"
          disabled={isEmpty}
          aria-label="Save signature"
        >
          Sign Document
        </button>
      </div>
    </div>
  );
};

export default SignaturePad;  */

import React, { useRef, useState, useCallback } from 'react';
import SignatureCanvas from 'react-signature-canvas';
// import { useFarcaster } from '../../hooks/useFarcaster';

interface SignaturePadProps {
  onComplete: (signatureData: string) => void;
  signatureRequestId: string;
}

const SignaturePad: React.FC<SignaturePadProps> = ({ onComplete, signatureRequestId }) => {
  const sigCanvas = useRef<SignatureCanvas>(null);
  const [isEmpty, setIsEmpty] = useState(true);
  // const { signWithFarcaster } = useFarcaster();

  const handleClear = useCallback(() => {
    sigCanvas.current?.clear();
    setIsEmpty(true);
  }, []);

  const handleSave = useCallback(async () => {
    if (sigCanvas.current && !sigCanvas.current.isEmpty()) {
      const signatureData = sigCanvas.current.toDataURL();
      try {
        // Placeholder for signing functionality
        console.log('Signing document:', signatureRequestId, signatureData);
        // await signWithFarcaster(signatureRequestId, signatureData);
        onComplete(signatureData);
      } catch (error) {
        console.error('Error signing document:', error);
        // Handle error (e.g., show error message to user)
      }
    } else {
      alert('Please provide a signature before saving.');
    }
  }, [signatureRequestId, onComplete]);

  const handleBegin = useCallback(() => setIsEmpty(false), []);

  const handleEnd = useCallback(() => {
    if (sigCanvas.current?.isEmpty()) {
      setIsEmpty(true);
    }
  }, []);

  return (
    <div className="signature-pad">
      <SignatureCanvas
        ref={sigCanvas}
        onBegin={handleBegin}
        onEnd={handleEnd}
        canvasProps={{
          className: 'signature-canvas',
          width: 500,
          height: 200,
        }}
      />
      <div className="signature-pad-controls">
        <button 
          onClick={handleClear}
          className="clear-button"
          aria-label="Clear signature"
        >
          Clear
        </button>
        <button 
          onClick={handleSave}
          className="save-button"
          disabled={isEmpty}
          aria-label="Save signature"
        >
          Sign Document
        </button>
      </div>
    </div>
  );
};

export default SignaturePad;