import { supabase } from '../supabase';

export async function getUnlinkedDevices(userId?: string) {
  try {
    const { data: sensors, error: sensorsError } = await supabase.rpc(
      'get_unlinked_sensors',
      { target_user_id: userId || null }
    );
    
    if (sensorsError) throw sensorsError;

    const { data: gateways, error: gatewaysError } = await supabase.rpc(
      'get_unlinked_gateways',
      { target_user_id: userId || null }
    );
    
    if (gatewaysError) throw gatewaysError;

    return {
      sensors: sensors || [],
      gateways: gateways || []
    };
  } catch (error) {
    console.error('Error fetching unlinked devices:', error);
    throw error;
  }
}

export async function linkSensor(sensorId: string, userId: string) {
  try {
    const { data, error } = await supabase
      .rpc('link_sensor', { 
        p_sensor_id: sensorId, 
        p_user_id: userId 
      });
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error linking sensor:', error);
    throw error;
  }
}

export async function linkGateway(gatewayId: string, userId: string) {
  try {
    const { data, error } = await supabase
      .rpc('link_gateway', { 
        p_gateway_id: gatewayId, 
        p_user_id: userId 
      });
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error linking gateway:', error);
    throw error;
  }
}

export async function unlinkSensor(sensorId: string, userId: string) {
  try {
    const { data, error } = await supabase
      .rpc('unlink_sensor', {
        p_sensor_id: sensorId,
        p_user_id: userId
      });
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error unlinking sensor:', error);
    throw error;
  }
}

export async function unlinkGateway(gatewayId: string, userId: string) {
  try {
    const { data, error } = await supabase
      .rpc('unlink_gateway', {
        p_gateway_id: gatewayId,
        p_user_id: userId
      });
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error unlinking gateway:', error);
    throw error;
  }
}
