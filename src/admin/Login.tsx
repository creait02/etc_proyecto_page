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

  const [resendTimer, setResendTimer] = useState(0);

  const startResendTimer = () => {
    setResendTimer(60);
    const interval = setInterval(() => {
      setResendTimer(current => {
        if (current <= 1) {
          clearInterval(interval);
          return 0;
        }
        return current - 1;
      });
    }, 1000);
  };

  const handleRequestOtp = async (e: React.FormEvent | null) => {
    if (e) e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');
    
    try {
      const emailLower = email.toLowerCase().trim();

      // 1. Verificación previa en nuestra tabla de permitidos
      const isAdminEmail = emailLower === 'it@corpocrea.com' || emailLower === 'j.montilla@corpocrea.com';
      
      if (!isAdminEmail) {
        const { data: allowed, error: checkError } = await supabase
          .from('allowed_users')
          .select('email')
          .eq('email', emailLower)
          .maybeSingle();

        if (checkError) throw new Error("Error al verificar permisos.");
        if (!allowed) {
          toast.error('Acceso no autorizado', {
            description: 'Tu correo no está en la lista de usuarios permitidos.'
          });
          setLoading(false);
          return;
        }
      }

      // 2. Si está en la lista (o es IT), pedimos el OTP a Supabase
      const { error } = await Promise.race([
        supabase.auth.signInWithOtp({ 
          email: emailLower,
          options: {
            shouldCreateUser: true, 
          }
        }),
        new Promise((_, reject) => setTimeout(() => reject(new Error("Tiempo de espera agotado. Revisa tu conexión.")), 15000))
      ]) as any;

      if (error) {
        if (error.message === 'Signups not allowed for otp') {
          toast.error('Error de Supabase', {
            description: 'Los registros están deshabilitados. Actívalos en el panel de Auth de Supabase.'
          });
        } else if (error.message.toLowerCase().includes('rate limit') || error.message.toLowerCase().includes('limit exceeded')) {
          toast.error('Límite excedido', {
            description: 'Has superado el límite de intentos. Por favor, intenta de nuevo en una hora.'
          });
        } else if (error.message.toLowerCase().includes('error sending magic link')) {
          toast.error('Error SMTP', {
            description: 'No se pudo enviar el correo. Revisa la configuración SMTP en Supabase.'
          });
        } else {
          toast.error('Error', { description: error.message });
        }
      } else {
        setStep('otp');
        startResendTimer();
        toast.success('Código enviado', {
          description: `Se ha enviado un código a ${emailLower}.`
        });
      }
    } catch (err: any) {
      console.error('OTP Request Error:', err);
      toast.error('Error', {
        description: err.message || 'Ocurrió un error al solicitar el código.'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const emailLower = email.toLowerCase().trim();

      // MOCK OTP FOR DEVELOPMENT/DEMO
      if (token === '123456') {
        console.warn('Ingresando con código de demostración.');
        localStorage.setItem('etc_demo_session', 'true');
        window.location.reload(); 
        return;
      }

      const { data, error } = await supabase.auth.verifyOtp({
        email: emailLower,
        token: token.trim(),
        type: 'email'
      });

      if (error) {
        toast.error('Código inválido', {
          description: 'El código es incorrecto o ha expirado. Asegúrate de copiar el código de 6 dígitos del correo.'
        });
      } else if (data.session) {
        toast.success('¡Bienvenido!', {
          description: 'Acceso concedido.'
        });
      }
    } catch (err: any) {
      console.error('OTP Verify Error:', err);
      toast.error('Error de verificación', {
        description: 'Ocurrió un error inesperado. Intenta de nuevo.'
      });
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
                placeholder="admin@corpocrea.com"
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
              <span className="text-zinc-600 mt-1 block">(Demo: usa 123456)</span>
            </p>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="space-y-6">
            <div className="text-center mb-4">
              <p className="text-[9px] uppercase tracking-widest text-zinc-500 mb-1">Código enviado a</p>
              <p className="text-[11px] text-white font-bold tracking-wider">{email}</p>
            </div>
            <div>
              <label className="block text-[10px] uppercase tracking-widest text-gray-400 mb-2 text-center">Ingresa el código enviado</label>
              <input 
                type="text" 
                value={token} 
                onChange={e => {
                  const val = e.target.value.replace(/\D/g, '').slice(0, 8);
                  setToken(val);
                }} 
                className="w-full bg-black border border-white/10 rounded p-3 text-white focus:border-white/30 outline-none transition-colors text-center text-3xl font-light tracking-[0.3em]" 
                placeholder="00000000"
                maxLength={8}
                required 
                autoFocus
              />
            </div>
            <div className="space-y-3">
              <button 
                type="submit" 
                disabled={loading || token.length < 6} 
                className="w-full bg-white text-black font-medium uppercase tracking-widest text-xs py-4 rounded hover:bg-gray-200 transition-colors disabled:opacity-50"
              >
                {loading ? 'Verificando...' : 'Ingresar'}
              </button>
              
              <div className="flex flex-col gap-3 pt-2">
                <button 
                  type="button"
                  disabled={resendTimer > 0 || loading}
                  onClick={() => handleRequestOtp(null)}
                  className="w-full text-[10px] uppercase tracking-widest text-blue-400 hover:text-blue-300 transition-colors disabled:text-zinc-600"
                >
                  {resendTimer > 0 ? `Reenviar código en ${resendTimer}s` : 'Reenviar código'}
                </button>

                <button 
                  type="button"
                  onClick={() => {
                    setStep('email');
                    setToken('');
                  }}
                  className="w-full text-[10px] uppercase tracking-widest text-gray-500 hover:text-white transition-colors"
                >
                  Cambiar email
                </button>
              </div>
            </div>
            <p className="text-[8px] text-zinc-700 text-center uppercase tracking-[0.2em] mt-4">
              Revisa tu carpeta de SPAM si no llega el código.
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
