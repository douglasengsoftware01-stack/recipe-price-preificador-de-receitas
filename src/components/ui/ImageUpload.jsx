import React, { useState } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import { colors } from '../../styles/GlobalStyles';

export const ImageUpload = ({
  value,
  onChange,
  placeholder = "Clique para selecionar uma imagem",
  className = ""
}) => {
  const [preview, setPreview] = useState(value || null);
  const [dragOver, setDragOver] = useState(false);

  const handleFileSelect = (file) => {
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const url = e.target.result;
        setPreview(url);
        onChange(file, url);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleFileInput = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const removeImage = () => {
    setPreview(null);
    onChange(null);
  };

  return (
    <div className={className}>
      {preview ? (
        <div style={{ position: 'relative', display: 'inline-block' }}>
          <img
            src={preview}
            alt="Preview"
            style={{
              width: '100%',
              height: '192px',
              objectFit: 'cover',
              borderRadius: '8px',
              border: `1px solid ${colors.gray[300]}`
            }}
          />
          <button
            type="button"
            onClick={removeImage}
            style={{
              position: 'absolute',
              top: '8px',
              right: '8px',
              padding: '8px',
              background: colors.red[500],
              color: colors.white,
              border: 'none',
              borderRadius: '50%',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'background-color 0.2s ease'
            }}
            onMouseEnter={(e) => e.target.style.background = colors.red[600]}
            onMouseLeave={(e) => e.target.style.background = colors.red[500]}
          >
            <X size={16} />
          </button>
        </div>
      ) : (
        <div
          style={{
            border: `2px dashed ${dragOver ? colors.primary[500] : colors.gray[300]}`,
            borderRadius: '8px',
            padding: '32px',
            textAlign: 'center',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            background: dragOver ? colors.primary[50] : colors.gray[50]
          }}
          onDrop={handleDrop}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onClick={() => document.getElementById('image-upload')?.click()}
        >
          <ImageIcon size={48} color={colors.gray[400]} style={{ margin: '0 auto 16px' }} />
          <p style={{ color: colors.gray[600], marginBottom: '8px' }}>{placeholder}</p>
          <p style={{ fontSize: '14px', color: colors.gray[500] }}>
            Arraste uma imagem aqui ou clique para selecionar
          </p>
          <p style={{ fontSize: '12px', color: colors.gray[400], marginTop: '8px' }}>
            Formatos aceitos: JPG, PNG, GIF (máx. 5MB)
          </p>
        </div>
      )}
      
      <input
        id="image-upload"
        type="file"
        accept="image/*"
        onChange={handleFileInput}
        style={{ display: 'none' }}
      />
    </div>
  );
};