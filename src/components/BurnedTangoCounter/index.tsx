import { useEffect, useState } from 'react';
import { getBalanceOf } from '../../functions/getBalanceOf';
import { useBlockNumber } from '../../state/application/hooks'
import Image from 'next/image';
import { useSushiContract } from '../../hooks'

const burningAddress = '0x0000000000000000000000626c61636b686f6c65';

const BurnedTangoCounter = () => {
  const blockNumber = useBlockNumber()
  const [burnedQty, setBurnedQty] = useState<number>(null)
  const sushi = useSushiContract();

  useEffect(() => {
    getBalanceOf(sushi, burningAddress).then(balance => setBurnedQty(balance))
  }, [blockNumber, sushi])

  return (
    <div className='flex items-center justify-center'>
        <Image src="/images/animations/burn.gif" width={260} height={240} alt="Tango" />

        <div className='text-center'>
          <h3 className='font-bold text-2xl'>Burned</h3>
          <p className='font-bold text-2xl'>{ burnedQty && `${burnedQty?.toLocaleString("en-US")} TANGO burned`}</p>
        </div>
    </div>
  )
}

export default BurnedTangoCounter
