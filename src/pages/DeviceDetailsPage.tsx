import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Clock, Timer, Hash, Code, Laptop, Network, MapPin, Route, RadioTower, Gauge, PlayCircle, ChevronRight, RefreshCw, MoreVertical, Bell, UserCircle, Loader2 } from 'lucide-react';

type Device = {
  id: string;
  status: boolean;
  login: string | null;
  serial_number: string | null;
  ipv4: string | null;
  manufacturer: string | null;
  model: string | null;
  description: string | null;
  software_version: string | null;
};

const InfoCard = ({ title, children, className }: { title: string, children: React.ReactNode, className?: string }) => (
  <div className={`bg-[rgba(25,31,83,0.5)] backdrop-blur-sm p-6 rounded-lg border border-[rgba(255,255,255,0.06)] ${className}`}>
    <h3 className="text-lg font-semibold text-white mb-4">{title}</h3>
    {children}
  </div>
);

const DeviceDetailsPage = () => {
  const { serial_number } = useParams<{ serial_number: string }>();
  const [device, setDevice] = useState<Device | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<any | null>(null);
  const [testError, setTestError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDeviceDetails = async () => {
      if (!serial_number) return;
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('devices')
        .select('*')
        .eq('serial_number', serial_number)
        .single();

      if (error) {
        console.error('Error fetching device details:', error);
        setError('Não foi possível carregar os detalhes do dispositivo.');
      } else {
        setDevice(data);
      }
      setLoading(false);
    };

    fetchDeviceDetails();
  }, [serial_number]);

  const runSpeedTest = async () => {
    if (!serial_number) return;
    setIsTesting(true);
    setTestResult(null);
    setTestError(null);

    try {
      const { data, error } = await supabase.functions.invoke('speed-test', {
        body: { serial_number },
      });

      if (error) throw error;
      if (data.error) throw new Error(data.error);

      setTestResult(data);
    } catch (err: any) {
      console.error("Error running speed test:", err);
      setTestError(JSON.stringify(err, null, 2) || "Ocorreu um erro ao iniciar o teste de velocidade.");
    } finally {
      setIsTesting(false);
    }
  };

  if (loading) {
    return <div className="text-center text-gray-400">Carregando detalhes do dispositivo...</div>;
  }

  if (error) {
    return <div className="text-center text-red-400">{error}</div>;
  }

  if (!device) {
    return <div className="text-center text-gray-400">Dispositivo não encontrado.</div>;
  }

  return (
    <div className="w-full max-w-screen-xl mx-auto p-4 sm:p-6 lg:p-8 text-white">
      <header className="flex flex-wrap justify-between items-center gap-4 mb-8">
        <div className="flex items-center gap-4">
          <Link to="/dashboard">
            <Button variant="outline" size="icon" className="bg-transparent border-gray-700 hover:bg-gray-800">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold">{device.manufacturer} {device.model}</h1>
              <span className="bg-blue-500/20 text-blue-300 text-xs font-semibold px-2 py-1 rounded-full">Beta</span>
            </div>
            <p className="text-sm text-gray-400">{device.login} ({device.ipv4})</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
            <span className="text-sm text-brand-gold">7547</span>
            <Button variant="ghost" size="icon"><RefreshCw className="h-4 w-4" /></Button>
            <Button variant="ghost" size="icon"><Bell className="h-4 w-4" /></Button>
            <Button variant="ghost" size="icon"><UserCircle className="h-4 w-4" /></Button>
            <Button variant="ghost" size="icon"><MoreVertical className="h-4 w-4" /></Button>
        </div>
      </header>

      <nav className="mb-8">
        <ul className="flex items-center gap-6 border-b border-gray-800 overflow-x-auto pb-2">
          {['Resumo', 'Conectividade', 'Diagnósticos', 'Arquivos', 'Propriedades', 'Logs'].map(tab => (
            <li key={tab} className={`py-3 border-b-2 text-sm font-medium whitespace-nowrap ${tab === 'Resumo' ? 'border-brand-gold text-brand-gold' : 'border-transparent text-gray-400 hover:text-white'}`}>
              <a href="#">{tab}</a>
            </li>
          ))}
        </ul>
      </nav>

      <main className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <div className="space-y-6">
          <InfoCard title="Informações do dispositivo">
            <div className="space-y-4 text-sm">
              <div className="flex items-center gap-3"><Clock className="text-gray-400" size={20} /><p>19 minutos atrás <span className="block text-xs text-gray-500">Última conexão</span></p></div>
              <div className="flex items-center gap-3"><Timer className="text-gray-400" size={20} /><p>3 horas <span className="block text-xs text-gray-500">Uptime (na última conexão)</span></p></div>
              <div className="flex items-center gap-3"><Hash className="text-gray-400" size={20} /><p>{device.serial_number} <span className="block text-xs text-gray-500">Número de série</span></p></div>
              <div className="flex items-center gap-3"><Code className="text-gray-400" size={20} /><p>{device.software_version} <span className="block text-xs text-gray-500">Versão de firmware</span></p></div>
            </div>
          </InfoCard>
          <InfoCard title="Dispositivos conectados">
            <div className="flex justify-around text-center">
              <div><p className="text-3xl font-bold">0</p><p className="text-sm text-gray-400">Dispositivos</p></div>
              <div><p className="text-3xl font-bold">2</p><p className="text-sm text-gray-400">Média</p></div>
            </div>
            <div className="text-center mt-6 text-gray-500">
              <Laptop size={40} className="mx-auto mb-2" />
              <p>Sem dispositivos ativos</p>
            </div>
          </InfoCard>
        </div>

        <div className="space-y-6">
          <InfoCard title="Portas físicas">
            <div className="flex justify-around my-4">
              <Network className="text-purple-400" size={32} />
              <Network className="text-gray-500" size={32} />
              <Network className="text-gray-500" size={32} />
              <Network className="text-gray-500" size={32} />
            </div>
            <h4 className="font-semibold text-white mt-6 mb-2">Leituras de TX/RX</h4>
            <p className="text-sm text-gray-500">Não há leituras de TX/RX</p>
          </InfoCard>
          <InfoCard title="Diagnósticos">
            <ul className="space-y-3">
              <li className="flex justify-between items-center"><div className="flex items-center gap-3"><MapPin size={20} /><span>Teste de ping</span></div><Button variant="ghost" size="icon"><PlayCircle /></Button></li>
              <li className="flex justify-between items-center"><div className="flex items-center gap-3"><Route size={20} /><span>Traceroute</span></div><Button variant="ghost" size="icon"><PlayCircle /></Button></li>
              <li className="flex justify-between items-center"><div className="flex items-center gap-3"><RadioTower size={20} /><span>Redes próximas</span></div><Button variant="ghost" size="icon"><ChevronRight /></Button></li>
              <li className="border-t border-gray-700 pt-3">
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3"><Gauge size={20} /><span>Teste de velocidade</span></div>
                    <Button variant="ghost" size="icon" onClick={runSpeedTest} disabled={isTesting}>
                        {isTesting ? <Loader2 className="animate-spin" /> : <PlayCircle />}
                    </Button>
                </div>
                {testResult && (
                    <div className="mt-3 p-3 bg-gray-900/50 rounded-md text-xs">
                        <p className="font-semibold text-green-400">Teste iniciado com sucesso!</p>
                        <pre className="mt-1 text-gray-300 whitespace-pre-wrap break-all">{JSON.stringify(testResult, null, 2)}</pre>
                    </div>
                )}
                {testError && (
                    <div className="mt-3 p-3 bg-red-900/50 rounded-md text-xs text-red-300">
                        <p className="font-semibold">Erro:</p>
                        <pre className="whitespace-pre-wrap break-all">{testError}</pre>
                    </div>
                )}
              </li>
            </ul>
          </InfoCard>
        </div>

        <div className="space-y-6 md:col-span-2 lg:col-span-1 xl:col-span-1">
          <InfoCard title="Interfaces WAN">
            <div className="flex gap-2 mb-4">
              <Button variant="secondary" className="bg-gray-700">PPP</Button>
              <Button variant="ghost">IP</Button>
            </div>
            <p className="text-sm text-gray-500">Nenhuma interface WAN configurada.</p>
          </InfoCard>
          <InfoCard title="Redirecionamento de portas">
            <p className="text-sm text-gray-500 text-center py-8">Sem redirecionamentos<br/><span className="text-xs">Os redirecionamentos aparecerão aqui</span></p>
          </InfoCard>
        </div>

        <div className="md:col-span-2 lg:col-span-3 xl:col-span-1">
          <InfoCard title="Redes Wi-Fi - 2.4 GHz">
            <div className="flex gap-2 mb-4">
              <Button variant="secondary" className="bg-gray-700">2.4 GHz</Button>
              <Button variant="ghost">5.8 GHz</Button>
            </div>
            <div className="space-y-4">
              <div className="bg-gray-900/50 p-3 rounded-md"><p className="font-medium">Andrieli Tramonti</p><p className="text-xs text-gray-400">Canal 11</p><p className="text-xs text-gray-400">Senha desconhecida</p></div>
              <div className="bg-gray-900/50 p-3 rounded-md"><p className="font-medium">TP-Link_008B_2</p><p className="text-xs text-gray-400">Canal 11</p><p className="text-xs text-gray-400">Senha desconhecida</p></div>
            </div>
          </InfoCard>
        </div>
      </main>
    </div>
  );
};

export default DeviceDetailsPage;