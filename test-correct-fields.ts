import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function testCorrectFields() {
  const { data: lastOrder } = await supabase
    .from('orders')
    .select('id')
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  const { data: product } = await supabase
    .from('products')
    .select('id')
    .limit(1)
    .single()

  if (!lastOrder || !product) {
    console.log('❌ Missing data')
    return
  }

  console.log('Testing with price and subtotal...\n')
  
  const testItem = {
    order_id: lastOrder.id,
    product_id: product.id,
    quantity: 2,
    price: 100,
    subtotal: 200,
  }

  const { data: fullItem, error } = await supabase
    .from('order_items')
    .insert(testItem)
    .select('*')
    .single()

  if (error) {
    console.log('❌ Error:', error.message)
  } else {
    console.log('✅ SUCCESS!\n')
    console.log('📋 Full order_items structure:')
    console.log(JSON.stringify(fullItem, null, 2))
    console.log('\n📝 Required fields:')
    Object.keys(fullItem).forEach(key => {
      console.log(`  • ${key}`)
    })
    
    // Clean up
    await supabase.from('order_items').delete().eq('id', fullItem.id)
  }
}

testCorrectFields()
