import { supabase } from '../supabase';

export async function getUserGateways(userId: string) {
  try {
    interface GatewayData {
      id: string;
      friendly_name: string | null;
      name: string;
      ssid: string | null;
      rssi: number | null;
      uptime: number | null;
      last_seen: string | null;
    }

    interface GatewayResponse {
      gateway: GatewayData;
    }

    const { data, error } = await supabase
      .from('user_gateways')
      .select(`
        gateway:gateway_id (
          id,
          friendly_name,
          name,
          ssid,
          rssi,
          uptime,
          last_seen
        )`)
      .eq('user_id', userId)
      .order('last_seen', { ascending: false, foreignTable: 'gateway' });
    
    if (error) throw error;
    
    if (!data) return [];

    return (data as unknown as GatewayResponse[]).map(item => {
      return {
        id: item.gateway.id,
        friendly_name: item.gateway.friendly_name || item.gateway.name,
        name: item.gateway.name,
        ssid: item.gateway.ssid,
        rssi: item.gateway.rssi,
        uptime: item.gateway.uptime,
        last_seen: item.gateway.last_seen
      };
    });
  } catch (error) {
    console.error('Error fetching user gateways:', error);
    throw error;
  }
}

export async function updateGatewayName(gatewayId: string, friendlyName: string) {
  try {
    const { data: userGateway, error: accessError } = await supabase
      .from('user_gateways')
      .select('gateway_id')
      .eq('gateway_id', gatewayId)
      .single();
    
    if (accessError) {
      console.error('Access verification error:', accessError);
      throw new Error('Access denied');
    }

    if (!userGateway) {
      throw new Error('Gateway not found');
    }

    const { data, error } = await supabase
      .from('gateway')
      .update({ 
        friendly_name: friendlyName.trim() || null,
        updated_at: new Date().toISOString()
      })
      .eq('id', gatewayId)
      .select(`
        id,
        friendly_name,
        name,
        ssid,
        rssi,
        uptime,
        last_seen
      `)
      .maybeSingle();
    
    if (error) {
      console.error('Supabase error:', error);
      throw new Error('Failed to update gateway name');
    }
    
    if (!data) {
      throw new Error('Gateway not found');
    }
    
    return {
      ...data,
      friendly_name: data.friendly_name || data.name
    };
  } catch (error) {
    console.error('Error updating gateway name:', error);
    throw error;
  }
}

export async function updateGatewayWifi(gatewayId: string, ssid: string, password: string) {
  try {
    const { data, error } = await supabase
      .rpc('update_gateway_wifi', { 
        p_gateway_id: gatewayId,
        p_ssid: ssid,
        p_password: password
      });
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating gateway WiFi:', error);
    throw error;
  }
}
