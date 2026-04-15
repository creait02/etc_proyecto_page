import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';

export default function Login() {
  const [email, setEmail] = useState('');
  const [token, setToken] = useState('');
  const [step, setStep] = useState<'email' | 'otp'>('email');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');
    
    try {
      const { error } = await supabase.auth.signInWithOtp({ 
        email,
        options: {
          shouldCreateUser: false, // Only allow existing users (admins)
        }
      });

      if (error) {
        toast.error('Error de autenticación', {
          description: error.message
        });
      } else {
        setStep('otp');
        toast.success('Código enviado', {
          description: 'Se ha enviado un código de acceso a tu correo.'
        });
      }
    } catch (err: any) {
      console.error('OTP Request Error:', err);
      if (err.message === 'Failed to fetch') {
        toast.error('Error de conexión', {
          description: 'No se pudo contactar con el servidor de autenticación. Verifica tu internet.'
        });
      } else {
        toast.error('Error inesperado', {
          description: 'Ocurrió un error al solicitar el código.'
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      // MOCK OTP FOR DEVELOPMENT/DEMO
      // Si el código es 123456, permitimos el ingreso de demostración
      if (token === '123456') {
        console.warn('Ingresando con código de demostración.');
        localStorage.setItem('etc_demo_session', 'true');
        // Forzamos un recargo o un cambio de estado que AdminApp detectará
        window.location.reload(); 
        return;
      }

      const { error } = await supabase.auth.verifyOtp({
        email,
        token,
        type: 'email'
      });

      if (error) {
        toast.error('Código inválido', {
          description: 'El código ingresado es incorrecto o ha expirado.'
        });
      } else {
        toast.success('¡Bienvenido!', {
          description: 'Has ingresado correctamente al panel de administración.'
        });
      }
    } catch (err: any) {
      console.error('OTP Verify Error:', err);
      if (err.message === 'Failed to fetch') {
        toast.error('Error de conexión', {
          description: 'No se pudo verificar el código. Revisa tu conexión.'
        });
      } else {
        toast.error('Error de verificación', {
          description: 'Ocurrió un error al intentar validar el código.'
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4 text-white font-sans">
      <div className="bg-zinc-900 p-8 rounded-xl w-full max-w-md border border-white/10 shadow-2xl">
        <h2 className="text-2xl font-light mb-8 uppercase tracking-[0.2em] text-center">ETC Admin</h2>
        
        {step === 'email' ? (
          <form onSubmit={handleRequestOtp} className="space-y-6">
            <div>
              <label className="block text-[10px] uppercase tracking-widest text-gray-400 mb-2">Email del Administrador</label>
              <input 
                type="email" 
                value={email} 
                onChange={e => setEmail(e.target.value)} 
                className="w-full bg-black border border-white/10 rounded p-3 text-white focus:border-white/30 outline-none transition-colors" 
                placeholder="admin@etcproyecto.com"
                required 
              />
            </div>
            <button 
              type="submit" 
              disabled={loading} 
              className="w-full bg-white text-black font-medium uppercase tracking-widest text-xs py-4 rounded hover:bg-gray-200 transition-colors disabled:opacity-50 mt-4"
            >
              {loading ? 'Enviando...' : 'Solicitar Código'}
            </button>
            <p className="text-[10px] text-gray-500 text-center uppercase tracking-widest leading-relaxed">
              Recibirás un código de acceso único en tu correo electrónico.
              <br />
              <span className="text-zinc-600 mt-1 block">(Modo Desarrollo: Usa el código 123456)</span>
            </p>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="space-y-6">
            <div>
              <label className="block text-[10px] uppercase tracking-widest text-gray-400 mb-2">Código de Acceso</label>
              <input 
                type="text" 
                value={token} 
                onChange={e => setToken(e.target.value)} 
                className="w-full bg-black border border-white/10 rounded p-3 text-white focus:border-white/30 outline-none transition-colors text-center text-xl tracking-[0.5em]" 
                placeholder="000000"
                maxLength={6}
                required 
              />
            </div>
            <button 
              type="submit" 
              disabled={loading} 
              className="w-full bg-white text-black font-medium uppercase tracking-widest text-xs py-4 rounded hover:bg-gray-200 transition-colors disabled:opacity-50 mt-4"
            >
              {loading ? 'Verificando...' : 'Verificar e Ingresar'}
            </button>
            <button 
              type="button"
              onClick={() => setStep('email')}
              className="w-full text-[10px] uppercase tracking-widest text-gray-500 hover:text-white transition-colors"
            >
              Volver a ingresar email
            </button>
            <p className="text-[9px] text-zinc-600 text-center uppercase tracking-widest mt-4">
              ¿No recibes el código? Usa 123456 para demostración.
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
