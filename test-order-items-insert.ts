import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function testInsert() {
  console.log('🧪 Testing order_items insert with different field combinations...\n')

  // First, let's get the last order to use as a test
  const { data: lastOrder } = await supabase
    .from('orders')
    .select('id')
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  if (!lastOrder) {
    console.log('❌ No orders found to test with')
    return
  }

  console.log(`Using order ID: ${lastOrder.id}\n`)

  // Test 1: Minimal fields
  console.log('Test 1: Minimal fields (order_id, product_id, quantity, unit_price, total_price)')
  const test1 = {
    order_id: lastOrder.id,
    product_id: '00000000-0000-0000-0000-000000000001',
    quantity: 1,
    unit_price: 100,
    total_price: 100,
  }
  
  let { error: error1 } = await supabase.from('order_items').insert(test1)
  if (error1) {
    console.log('❌ Error:', error1.message)
    console.log('Details:', error1.details)
    console.log('Hint:', error1.hint)
  } else {
    console.log('✅ Success with minimal fields!')
    // Clean up
    await supabase.from('order_items').delete().eq('order_id', lastOrder.id)
  }

  console.log('\nTest 2: With product_name and product_description')
  const test2 = {
    order_id: lastOrder.id,
    product_id: '00000000-0000-0000-0000-000000000001',
    product_name: 'Test Product',
    product_description: 'Test Description',
    quantity: 1,
    unit_price: 100,
    total_price: 100,
  }
  
  let { error: error2 } = await supabase.from('order_items').insert(test2)
  if (error2) {
    console.log('❌ Error:', error2.message)
    console.log('Details:', error2.details)
    console.log('Hint:', error2.hint)
  } else {
    console.log('✅ Success with product details!')
    // Clean up
    await supabase.from('order_items').delete().eq('order_id', lastOrder.id)
  }

  console.log('\nTest 3: Check what columns exist by trying to select them')
  const { data: testSelect, error: selectError } = await supabase
    .from('order_items')
    .select('id, order_id, product_id, quantity, unit_price, total_price, product_name, product_description, price, name, description')
    .limit(1)

  if (selectError) {
    console.log('❌ Select error reveals missing columns:', selectError.message)
  } else {
    console.log('✅ These columns exist:', Object.keys(testSelect || {}))
  }
}

testInsert()
