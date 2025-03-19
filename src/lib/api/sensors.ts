import { supabase } from '../supabase';

export async function getUserSensors(userId: string) {
  try {
    const { data: userSensors, error: userSensorsError } = await supabase
      .from('user_sensors')
      .select('*')
      .eq('user_id', userId);
    
    if (userSensorsError) throw userSensorsError;
    if (!userSensors) return [];
    
    const sensorIds = userSensors.map(us => us.sensor_id);
    
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
