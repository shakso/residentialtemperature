import { supabase } from '../supabase';

export async function getAllUsers() {
  try {
    const { data, error } = await supabase
      .from('user_list')
      .select('*')
      .order('last_name', { ascending: true });
    
    if (error) throw error;
    
    return (data || []).map(user => ({
      id: user.id,
      email: user.email,
      first_name: user.first_name || '',
      last_name: user.last_name || ''
    }));
  } catch (error) {
    console.error('Error fetching users:', error);
    throw error;
  }
}

export async function getUserDevices(userId: string) {
  try {
    const { data: sensors, error: sensorsError } = await supabase
      .from('user_sensors')
      .select(`
        sensor:sensor_id (
          id,
          mac,
          friendly_name
        )
      `)
      .eq('user_id', userId);
    
    if (sensorsError) throw sensorsError;

    const { data: gateways, error: gatewaysError } = await supabase
      .from('user_gateways')
      .select(`
        gateway:gateway_id (
          id,
          name,
          friendly_name
        )
      `)
      .eq('user_id', userId);
    
    if (gatewaysError) throw gatewaysError;

    return {
      sensors: (sensors || []).map(s => s.sensor),
      gateways: (gateways || []).map(g => g.gateway)
    };
  } catch (error) {
    console.error('Error fetching user devices:', error);
    throw error;
  }
}
