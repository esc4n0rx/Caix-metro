import { LoginForm } from "@/components/login-form"

export default function Home() {
  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 relative"
      style={{
        backgroundImage: "url('/images/fundo-login.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <div className="absolute inset-0 bg-black/30"></div>
      <div className="w-full max-w-md relative z-10">
        {/* <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Caixômetro</h1>
          <p className="text-orange-100">"Controle de ativos sem complicação"</p>
        </div> */}
        <LoginForm />
      </div>
    </div>
  )
}
