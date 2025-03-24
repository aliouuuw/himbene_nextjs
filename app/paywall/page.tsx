'use client';
import { useState, useEffect } from 'react';
import { getOrCreateDeadline } from '@/app/actions/deadline';
import { authClient } from '@/lib/auth-client';

export default function PaywallPage() {
  const [days, setDays] = useState(0);
  const [hours, setHours] = useState(0);
  const [minutes, setMinutes] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const { 
    data: session,
} = authClient.useSession() 

  useEffect(() => {
    // Check if user is authenticated and sign out
    if (session) {
      authClient.signOut();
    }

    let timer: NodeJS.Timeout;
    
    async function fetchDeadline() {
      try {
        setIsLoading(true);
        const deadlineData = await getOrCreateDeadline();
        const deadlineDate = new Date(deadlineData.deadline);
        
        // Start the countdown
        timer = setInterval(() => {
          const now = new Date().getTime();
          const t = deadlineDate.getTime() - now;
          
          setDays(Math.floor(t / (1000 * 60 * 60 * 24)));
          setHours(Math.floor((t % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)));
          setMinutes(Math.floor((t % (1000 * 60 * 60)) / (1000 * 60)));
          setSeconds(Math.floor((t % (1000 * 60)) / 1000));

          if (t < 0) {
            clearInterval(timer);
            setDays(0);
            setHours(0);
            setMinutes(0);
            setSeconds(0);
          }
        }, 1000);
      } catch (error) {
        console.error('Error fetching deadline:', error);
        // Fallback to client-side deadline if server action fails
        const fallbackDeadline = new Date();
        fallbackDeadline.setDate(fallbackDeadline.getDate() + 7);
        
        timer = setInterval(() => {
          const now = new Date().getTime();
          const t = fallbackDeadline.getTime() - now;
          
          setDays(Math.floor(t / (1000 * 60 * 60 * 24)));
          setHours(Math.floor((t % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)));
          setMinutes(Math.floor((t % (1000 * 60 * 60)) / (1000 * 60)));
          setSeconds(Math.floor((t % (1000 * 60)) / 1000));

          if (t < 0) {
            clearInterval(timer);
            setDays(0);
            setHours(0);
            setMinutes(0);
            setSeconds(0);
          }
        }, 1000);
      } finally {
        setIsLoading(false);
      }
    }

    fetchDeadline();
    
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [session]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <div className="max-w-md w-full space-y-8 p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-bold text-gray-900 dark:text-gray-100">
            Service Temporairement Suspendu
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Cher client,
          </p>
          <div className="mt-4 text-sm text-gray-500 dark:text-gray-400 space-y-4">
            <p>
              Nous regrettons de vous informer que l&apos;accès à ce service a été temporairement suspendu en raison de problèmes de paiement en attente.
            </p>
            <p>
              Pour rétablir l&apos;accès complet à la plateforme, veuillez régler tous les paiements en attente.
            </p>

            {/* Countdown Timer */}
            <div className="mt-6 p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
              <p className="font-medium mb-2">Temps restant avant la désactivation permanente:</p>
              {isLoading ? (
                <p className="text-center py-2">Chargement...</p>
              ) : (
                <div className="grid grid-cols-4 gap-2 text-center">
                  <div>
                    <span className="block text-2xl font-bold">{days}</span>
                    <span className="text-sm">Jours</span>
                  </div>
                  <div>
                    <span className="block text-2xl font-bold">{hours}</span>
                    <span className="text-sm">Heures</span>
                  </div>
                  <div>
                    <span className="block text-2xl font-bold">{minutes}</span>
                    <span className="text-sm">Minutes</span>
                  </div>
                  <div>
                    <span className="block text-2xl font-bold">{seconds}</span>
                    <span className="text-sm">Secondes</span>
                  </div>
                </div>
              )}
            </div>

            <p>
              Pour une assistance immédiate ou pour effectuer votre paiement, veuillez contacter:
            </p>
            <div className="mt-4 p-4 bg-gray-100 dark:bg-gray-700 rounded-lg flex flex-col gap-2">
              <a className="font-medium hover:underline" href="https://aliou.online" target="_blank">Aliou Wade</a>
              <a 
                href="mailto:wadealiou00@gmail.com"
                target="_blank"
                className="text-blue-600 dark:text-blue-400 hover:underline"
              >
                wadealiou00@gmail.com
              </a>
              <div className="flex gap-2 justify-center">

              <a
                href="https://wa.me/18193182192"
                target="_blank"
                className="text-blue-600 dark:text-blue-400 hover:underline font-semibold"
              >
                +1(819)3182192
              </a>
              <span className="text-gray-500 dark:text-gray-400">|</span>
              <a
                href="tel:+221777228845"
                className="text-blue-600 dark:text-blue-400 hover:underline font-semibold"
              >
                +221777228845
              </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 