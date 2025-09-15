import UnnamedOracle from '../components/UnnamedOracle'
import MirrorRenderer from '../components/MirrorRenderer'
import BookOfEchoes from '../components/BookOfEchoes'

export default function TimeMirror() {
  return (
    <div className="flex h-screen">
      <div className="w-1/2 p-4 bg-black text-white">
        <UnnamedOracle />
      </div>
      <div className="w-1/2 p-4 bg-gray-900">
        <MirrorRenderer />
      </div>
      <BookOfEchoes />
    </div>
  )
}
