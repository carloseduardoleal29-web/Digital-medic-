import React, { useState } from 'react';

const DoctorAuthModal: React.FC = () => {
  const [email, setEmail] = useState('');
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg w-96">
        <h2 className="text-xl font-bold mb-4">Autenticación Médica</h2>
        <input 
          type="email" 
          value={email} 
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Correo electrónico"
          className="w-full p-2 border rounded mb-4"
        />
        <button className="w-full bg-blue-600 text-white p-2 rounded">Ingresar</button>
      </div>
    </div>
  );
};

export default DoctorAuthModal;
