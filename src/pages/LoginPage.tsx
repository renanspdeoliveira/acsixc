import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

const LoginPage = () => {
  return (
    <div className="mx-auto w-full max-w-md rounded-2xl bg-[rgba(18,23,74,0.6)] backdrop-blur-md border border-[rgba(255,255,255,0.04)] shadow-lg p-8">
      {/* Card Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-gradient-to-br from-brand-gold-light to-brand-gold rounded-md"></div>
        <div>
          <h1 className="text-white font-bold text-lg">FuturaNet</h1>
          <p className="text-gray-300 text-xs">Painel ACS</p>
        </div>
      </div>

      {/* Form Title */}
      <div className="mb-6 text-center">
        <h2 className="text-2xl font-semibold text-white">Entrar no painel</h2>
        <p className="text-gray-400 text-sm mt-1">
          Acesse o painel de clientes e técnicos
        </p>
      </div>

      {/* Form */}
      <form className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="email" className="text-gray-300">E-mail</Label>
          <Input
            id="email"
            type="email"
            placeholder="seu@email.com"
            className="bg-[rgba(255,255,255,0.04)] border-transparent focus:border-brand-gold focus:ring-brand-gold focus:shadow-gold-glow transition-all"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password" className="text-gray-300">Senha</Label>
          <Input
            id="password"
            type="password"
            placeholder="••••••••"
            className="bg-[rgba(255,255,255,0.04)] border-transparent focus:border-brand-gold focus:ring-brand-gold focus:shadow-gold-glow transition-all"
          />
        </div>

        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <Checkbox id="remember-me" className="border-gray-500 data-[state=checked]:bg-brand-gold data-[state=checked]:border-brand-gold" />
            <Label htmlFor="remember-me" className="text-gray-300 font-normal cursor-pointer">Manter-me conectado</Label>
          </div>
          <a href="#" className="text-brand-gold hover:underline">
            Esqueci a senha
          </a>
        </div>

        <Button
          type="submit"
          className="w-full bg-brand-gold text-brand-blue font-bold hover:bg-brand-gold/90"
        >
          Entrar
        </Button>
      </form>

      {/* Sign-up Link */}
      <div className="text-center mt-6 text-sm">
        <span className="text-gray-400">Não tem conta? </span>
        <a href="#" className="text-brand-gold font-semibold hover:underline">
          Cadastre-se
        </a>
      </div>
    </div>
  );
};

export default LoginPage;