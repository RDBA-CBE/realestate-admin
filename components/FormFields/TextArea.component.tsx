import React from 'react';

const TextArea = (props: any) => {
    const {
        value,
        onChange,
        placeholder,
        title,
        name,
        required,
        className,
        error,
        rows = 4,
        height = 'auto',
        ...rest
    } = props;

    return (
        <div className="w-full">
            {title && (
                <label className="block text-sm font-bold text-gray-700">
                    {title} {required && <span className="text-red-500">*</span>}
                </label>
            )}
            <textarea
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                name={name}
                rows={rows}
                className={`form-textarea ${className} ${error ? 'border-red-500' : ''}`} 
                required={required}
                style={{ height }}
                {...rest}
            />
            {error && (
                <p className="mt-2 text-sm text-red-600" id={`${name}-error`}>
                    {error}
                </p>
            )}
        </div>
    );
};

export default TextArea;
