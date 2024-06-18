import React, { useEffect, useRef } from 'react';


const BeeFreeEditor = ({ onChange }) => {
  const editorRef = useRef(null);

  useEffect(() => {
    window.BEEPlugin.createEditor(editorRef.current, {
      onSave: (payload) => {
        onChange(payload.body);
      },
    });
  }, [onChange]);

  return <div ref={editorRef} />;
};

export default BeeFreeEditor;