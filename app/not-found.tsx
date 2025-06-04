import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Home, ArrowLeft } from "lucide-react"

export default function NotFound() {
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
      <Card className="w-full max-w-2xl bg-card/95 backdrop-blur-sm border-0 shadow-2xl relative z-10">
        <CardContent className="p-8 text-center space-y-6">
          <div className="relative w-full h-48 rounded-lg overflow-hidden mb-6">
            <Image src="/images/fundo-login.png" alt="Página não encontrada" fill className="object-cover" />
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
              <div className="text-white">
                <h1 className="text-6xl font-bold mb-2">404</h1>
                <p className="text-xl">Página não encontrada</p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Oops! Esta página não existe</h2>
            <p className="text-muted-foreground max-w-md mx-auto">
              A página que você está procurando pode ter sido removida, teve seu nome alterado ou está temporariamente
              indisponível.
            </p>
          </div>

          <div className="flex items-center justify-center gap-4 pt-4">
            <Button asChild variant="outline">
              <Link href="/">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Voltar ao Login
              </Link>
            </Button>
            <Button asChild className="bg-orange-600 hover:bg-orange-700">
              <Link href="/dashboard">
                <Home className="mr-2 h-4 w-4" />
                Ir para Dashboard
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
