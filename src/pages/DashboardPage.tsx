import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Star, Filter, Eye, Settings, ChevronLeft, ChevronRight } from "lucide-react";

// Definindo o tipo para os dispositivos
type Device = {
  id: string;
  status: boolean;
  login: string | null;
  serial_number: string | null;
  ipv4: string | null;
  manufacturer: string | null;
  model: string | null;
  description: string | null;
};

const DashboardPage = () => {
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchCategory, setSearchCategory] = useState("login");

  const searchCategories = [
    { value: "login", label: "Login" },
    { value: "serial_number", label: "Serial Number" },
    { value: "ipv4", label: "IPv4" },
    { value: "manufacturer", label: "Fabricante" },
    { value: "model", label: "Modelo" },
    { value: "description", label: "Descrição" },
  ];

  useEffect(() => {
    const fetchDevices = async () => {
      setLoading(true);
      setError(null);

      let query = supabase.from("devices").select("*");

      if (searchQuery) {
        query = query.ilike(searchCategory, `%${searchQuery}%`);
      }

      const { data, error } = await query.order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching devices:", error);
        setError("Não foi possível carregar os dispositivos.");
      } else {
        setDevices(data as Device[]);
      }
      setLoading(false);
    };

    const searchTimeout = setTimeout(() => {
        fetchDevices();
    }, 300); // Debounce para evitar muitas requisições

    return () => clearTimeout(searchTimeout);
  }, [searchQuery, searchCategory]);

  const selectedCategoryLabel = searchCategories.find(c => c.value === searchCategory)?.label || "Login";

  const renderDeviceCard = (device: Device) => (
    <div key={device.id} className="bg-gray-800/50 p-4 rounded-lg border border-gray-800 space-y-3">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${device.status ? 'bg-green-500' : 'bg-red-500'}`}></div>
          <p className="font-bold text-white">{device.login}</p>
        </div>
        <p className="text-sm text-gray-400">{device.ipv4}</p>
      </div>
      <div className="text-sm space-y-1">
        <p><span className="font-semibold text-gray-300">Fabricante:</span> <span className="text-gray-400">{device.manufacturer}</span></p>
        <p><span className="font-semibold text-gray-300">Modelo:</span> <span className="text-gray-400">{device.model}</span></p>
        <p><span className="font-semibold text-gray-300">Descrição:</span> <span className="text-gray-400">{device.description}</span></p>
      </div>
    </div>
  );

  return (
    <div className="w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 bg-[rgba(18,23,74,0.6)] rounded-2xl border border-[rgba(255,255,255,0.04)] shadow-lg">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Dispositivos</h1>
          <p className="text-gray-300 mt-1">
            Gerencie os dispositivos conectados a sua rede.
          </p>
        </div>
        <div className="flex items-center gap-2 mt-4 sm:mt-0">
          <Button variant="ghost" size="icon"><Star className="h-4 w-4" /></Button>
          <Button variant="ghost"><Filter className="h-4 w-4 sm:mr-2" /><span className="hidden sm:inline">Filtros</span></Button>
          <Button variant="ghost"><Eye className="h-4 w-4 sm:mr-2" /><span className="hidden sm:inline">Visões</span></Button>
          <Button variant="outline" className="bg-transparent border-blue-400 text-blue-400 hover:bg-blue-400/10 hover:text-blue-300">
            <Settings className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">Configurações</span>
          </Button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-2 mb-6">
        <Select value={searchCategory} onValueChange={setSearchCategory}>
          <SelectTrigger className="w-full sm:w-[180px] bg-gray-800/50 border-gray-700">
            <SelectValue placeholder="Filtrar por..." />
          </SelectTrigger>
          <SelectContent className="bg-gray-900 border-gray-700 text-white">
            {searchCategories.map(cat => (
              <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="relative w-full flex-grow">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="text"
            placeholder={`Buscar por ${selectedCategoryLabel}...`}
            className="pl-10 bg-gray-800/50 border-gray-700 focus:border-brand-gold focus:ring-brand-gold"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Devices Table for Desktop */}
      <div className="hidden md:block border border-gray-800 rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-gray-800/50 border-b border-gray-800">
              <TableHead className="w-12"></TableHead>
              <TableHead>Login</TableHead>
              <TableHead>IPv4</TableHead>
              <TableHead>Fabricante</TableHead>
              <TableHead>Modelo</TableHead>
              <TableHead>Descrição</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-gray-400 py-8">Carregando dispositivos...</TableCell>
              </TableRow>
            ) : error ? (
               <TableRow>
                <TableCell colSpan={6} className="text-center text-red-400 py-8">{error}</TableCell>
              </TableRow>
            ) : devices.length > 0 ? (
              devices.map((device) => (
                <TableRow key={device.id} className="hover:bg-gray-800/50 border-b border-gray-800 last:border-b-0">
                  <TableCell>
                    <div className={`w-3 h-3 rounded-full ${device.status ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  </TableCell>
                  <TableCell className="font-medium">{device.login}</TableCell>
                  <TableCell>{device.ipv4}</TableCell>
                  <TableCell>{device.manufacturer}</TableCell>
                  <TableCell>{device.model}</TableCell>
                  <TableCell>{device.description}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-gray-400 py-8">Nenhum dispositivo encontrado.</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Devices Cards for Mobile */}
      <div className="md:hidden space-y-4">
        {loading ? (
          <p className="text-center text-gray-400 py-8">Carregando dispositivos...</p>
        ) : error ? (
          <p className="text-center text-red-400 py-8">{error}</p>
        ) : devices.length > 0 ? (
          devices.map(renderDeviceCard)
        ) : (
          <p className="text-center text-gray-400 py-8">Nenhum dispositivo encontrado.</p>
        )}
      </div>
      
      {/* Footer / Pagination */}
      <div className="flex justify-between items-center mt-4 text-sm text-gray-400">
        <p>1-{devices.length} de {devices.length} dispositivos</p>
        <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" className="h-8 w-8 bg-transparent border-gray-700"><ChevronLeft className="h-4 w-4" /></Button>
            <Button variant="outline" size="icon" className="h-8 w-8 bg-transparent border-gray-700"><ChevronRight className="h-4 w-4" /></Button>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;