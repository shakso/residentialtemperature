import { supabase } from './supabase';

// User profile functions
export async function getUserProfile(userId: string) {
  try {
    // First check if profile exists
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();
    
    // Handle case where profile doesn't exist yet
    if (error?.code === 'PGRST116') {
      // Create initial profile for demo user
      if (await isDemoUser()) {
        const { data: newProfile, error: createError } = await supabase
          .from('profiles')
          .insert({ 
            id: userId,
            role: 'read_only'
          })
          .select()
          .single();
          
        if (createError) throw createError;
        return newProfile;
      }
      
      // For non-demo users, return minimal profile
      return { id: userId };
    } else if (error) {
      throw error;
    }
    
    // Get subscription data separately
    if (data) {
      const { data: subscriptionData, error: subError } = await supabase
        .from('stripe_subscriptions')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();
      
      if (subError) {
        console.error('Error fetching subscription:', subError);
      } else if (subscriptionData) {
        data.stripe_subscriptions = [subscriptionData];
      }
    }
    
    return data || { id: userId };
  } catch (error) {
    console.error('Error fetching user profile:', error);
    throw error;
  }
}

// Helper function to check if current user is demo user
export async function isDemoUser(): Promise<boolean> {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) return false;
    return user.email === 'demo@residentialtemperature.com';
  } catch (err) {
    console.error('Error checking demo user status:', err);
    return false;
  }
}

export async function updateUserProfile(userId: string, data: any) {
  try {
    // First check if user is demo user
    if (await isDemoUser()) {
      throw new Error('Cannot modify data in Demo mode');
    }

    // Validate required fields
    if (!userId) {
      throw new Error('User ID is required');
    }

    if (!data || typeof data !== 'object') {
      throw new Error('Invalid update data');
    }

    // Parse data if it's a string
    const updateData = typeof data === 'string' ? JSON.parse(data) : data;

    // If first_name or last_name are being updated, also update auth.users metadata
    if (updateData.first_name !== undefined || updateData.last_name !== undefined) {
      const { error: authError } = await supabase.auth.updateUser({
        data: {
          first_name: updateData.first_name,
          last_name: updateData.last_name
        }
      });
      
      if (authError) throw authError;
    }

    const { data: updatedData, error } = await supabase
      .from('profiles')
      .update(updateData)
      .eq('id', userId)
      .select()
      .single();
    
    if (error) throw error;
    
    return updatedData;
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
}

export async function createUserProfile(userId: string, data: any) {
  try {
    const { data: createdData, error } = await supabase
      .from('profiles')
      .insert({ id: userId, ...data })
      .select()
      .single();
    
    if (error) throw error;
    
    return createdData;
  } catch (error) {
    console.error('Error creating user profile:', error);
    throw error;
  }
}

// User linking functions
export async function getAllUsers() {
  try {
    const { data, error } = await supabase
      .from('user_list')
      .select('*')
      .order('last_name', { ascending: true });
    
    if (error) throw error;
    
    // Transform the data to ensure consistent structure
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
    // Get user's sensors
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

    // Get user's gateways
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

// Device linking functions
export async function getUnlinkedDevices(userId?: string) {
  try {
    // Get unlinked sensors with explicit parameter name
    const { data: sensors, error: sensorsError } = await supabase.rpc(
      'get_unlinked_sensors',
      { target_user_id: userId || null }
    );
    
    if (sensorsError) throw sensorsError;

    // Get unlinked gateways with explicit parameter name
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

// Sensor functions
export async function getUserSensors(userId: string) {
  try {
    // Get sensors with their latest reading
    const { data: userSensors, error: userSensorsError } = await supabase
      .from('user_sensors')
      .select('*')
      .eq('user_id', userId);
    
    if (userSensorsError) throw userSensorsError;
    if (!userSensors) return [];
    
    const sensorIds = userSensors.map(us => us.sensor_id);
    
    // Get sensor details and their latest readings
    const { data: sensors, error: sensorsError } = await supabase
      .from('sensors')
      .select(`
        id,
        mac,
        friendly_name
      `)
      .in('id', sensorIds);
    
    if (sensorsError) throw sensorsError;
    if (!sensors) return [];
    
    // Get latest reading for each sensor
    const latestReadings = await Promise.all(
      sensors.map(async (sensor) => {
        const { data: readings, error: readingsError } = await supabase
          .from('readings')
          .select('tempc, hum, batt, rssi, created_on')
          .eq('sensor_id', sensor.id)
          .order('created_on', { ascending: false })
          .limit(1);
        
        if (readingsError) {
          console.error(`Error fetching readings for sensor ${sensor.id}:`, readingsError);
        }

        const latestReading = readings?.length ? readings[0] : null;

        const name = sensor.friendly_name || `Sensor ${sensor.mac.slice(-6)}`;
        
        return {
          id: sensor.id,
          name,
          mac: sensor.mac,
          temperature: latestReading?.tempc || null,
          humidity: latestReading?.hum || null,
          batteryLevel: latestReading?.batt || null,
          rssi: latestReading?.rssi || null,
          lastUpdated: latestReading?.created_on || null
        };
      })
    );
    
    return latestReadings;
  } catch (error) {
    console.error('Error fetching user sensors:', error);
    throw error;
  }
}

export async function updateSensorName(sensorId: string, friendlyName: string) {
  try {
    // First check if user is demo user
    if (await isDemoUser()) {
      throw new Error('Cannot modify data in Demo mode');
    }

    const { data, error } = await supabase
      .from('sensors')
      .update({ friendly_name: friendlyName })
      .eq('id', sensorId)
      .select()
      .single();
    
    if (error) throw error;
    
    return data || null;
  } catch (error) {
    console.error('Error updating sensor name:', error);
    throw error;
  }
}

export async function getSensorReadings(sensorId: string, hours: number = 6) {
  try {
    const { data, error } = await supabase
      .rpc('get_sensor_readings', { 
        p_sensor_id: sensorId,
        p_hours: hours,
        p_interval: hours <= 24 ? '15 minutes' : '1 hour'
      });
    
    if (error) throw error;
    
    if (!data || data.length === 0) return [];
    
    return data.map(reading => ({
      temperature: reading.tempc,
      humidity: reading.hum,
      batteryLevel: reading.batt,
      rssi: reading.rssi,
      timestamp: reading.created_on
    }));
  } catch (error) {
    console.error('Error fetching sensor readings:', error);
    throw error;
  }
}

// Gateway functions
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
    // First check if user is demo user
    if (await isDemoUser()) {
      throw new Error('Cannot modify data in Demo mode');
    }

    // First verify user has access to this gateway
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

export async function createSensor(mac: string) {
  try {
    const { data, error } = await supabase
      .rpc('create_sensor', { 
        p_mac: mac 
      });
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error creating sensor:', error);
    throw error;
  }
}

export async function inviteUser(email: string) {
  try {
    const { data, error } = await supabase.auth.admin.inviteUserByEmail(email);
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error inviting user:', error);
    throw error;
  }
}
