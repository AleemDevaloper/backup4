import React from 'react'

function  Dashmainheading ({ children, main }) {
  return (
    <div className='my-3 px-4'>
        <p className='fs-6' style={{ color: 'var(--text-primary)' }}> 
          <span style={{ color: 'var(--text-secondary)' }}>{main}</span> / <b style={{ color: 'var(--text-primary)' }}>{children}</b>
        </p>
    </div>
  )
}

export default Dashmainheading;
