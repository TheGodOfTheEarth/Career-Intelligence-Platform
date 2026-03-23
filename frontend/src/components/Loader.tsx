// components/Loader.tsx
import React from 'react'

const Loader: React.FC = () => {
   return (
      <div
         style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100vh',
         }}
      >
         Загрузка...
      </div>
   )
}

export default Loader
