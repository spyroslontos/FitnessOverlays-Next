import { SessionInfo } from "@/components/session-info"
import { Header } from "@/components/header"

export default function Home() {
  return (
    <>
    <Header />
    
    <div className="min-h-screen p-8">
      <div className="max-w-md mx-auto">
        <h1 className="text-2xl font-bold mb-6">Fitness Overlays</h1>
        <SessionInfo />
      </div>
    </div></>
  )
}
