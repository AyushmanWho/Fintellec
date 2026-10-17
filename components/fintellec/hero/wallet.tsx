/** A 240×160 layered wallet. Layers separate as the `--split` CSS variable grows from 0 to 1. */
export function Wallet() {
  return (
    <div className="wallet-float relative h-[160px] w-[240px]" aria-hidden>
      <div
        className="absolute inset-0 rounded-[30px] shadow-[0_34px_60px_-24px_rgba(6,53,104,0.55)]"
        style={{
          background: 'linear-gradient(145deg, #0A9A90 0%, #063568 85%)',
          transform: 'translateY(calc(var(--split, 0) * -8px)) rotate(calc(var(--split, 0) * -3deg))',
        }}
      />
      <div
        className="absolute inset-x-8 -top-1 h-[100px] rounded-[18px] border border-white/60"
        style={{
          background: 'linear-gradient(135deg, #FFFFFF, #B9F0E9)',
          transform: 'translateY(calc(var(--split, 0) * -30px)) rotate(calc(var(--split, 0) * -6deg))',
        }}
      />
      <div
        className="absolute inset-x-4 -top-4 flex h-[108px] flex-col justify-between rounded-[18px] border border-white/50 p-3.5"
        style={{
          background: 'linear-gradient(135deg, #65DED2 0%, #07877F 100%)',
          transform: 'translateY(calc(var(--split, 0) * -60px)) rotate(calc(var(--split, 0) * 4deg))',
        }}
      >
        <div className="flex items-center justify-between">
          <span className="h-4 w-6 rounded-[5px] bg-white/45" />
          <span className="text-[8px] font-medium uppercase tracking-[0.3em] text-white/85">Fintellec</span>
        </div>
      </div>
      <div
        className="absolute inset-x-0 bottom-0 h-[106px] rounded-[28px] border border-white/80 bg-white/60 px-5 py-4 shadow-[0_20px_40px_-24px_rgba(6,53,104,0.45)] backdrop-blur-md"
        style={{ transform: 'translateY(calc(var(--split, 0) * 18px))' }}
      >
        <p className="text-[9px] font-medium uppercase tracking-[0.24em] text-steel">Balance</p>
        <p className="mt-1 text-[26px] font-medium leading-none tracking-tight text-navy">₹24,580</p>
        <div className="mt-3 h-px w-full bg-gradient-to-r from-teal/60 via-bright/40 to-transparent" />
      </div>
    </div>
  )
}
