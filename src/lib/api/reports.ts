import { supabase } from '../supabase';

export interface TemperatureStats {
  min_temp: number;
  max_temp: number;
  avg_temp: number;
  min_temp_sensor_name: string;
  max_temp_sensor_name: string;
  min_temp_time: string;
  max_temp_time: string;
}

export interface SensorTemperatureStats {
  sensor_id: string;
  sensor_name: string;
  min_temp: number;
  max_temp: number;
  avg_temp: number;
  min_temp_time: string;
  max_temp_time: string;
}

export async function getTemperatureStats(userId: string, startDate: Date | string, endDate: Date | string): Promise<TemperatureStats> {
  try {
    // Ensure we have proper Date objects
    const start = typeof startDate === 'string' ? new Date(startDate) : startDate;
    const end = typeof endDate === 'string' ? new Date(endDate) : endDate;

    // Validate dates
    if (!(start instanceof Date) || isNaN(start.getTime())) {
      throw new Error('Invalid start date');
    }
    if (!(end instanceof Date) || isNaN(end.getTime())) {
      throw new Error('Invalid end date');
    }

    const { data, error } = await supabase.rpc('get_temperature_stats', {
      p_user_id: userId,
      p_start_date: start.toISOString(),
      p_end_date: end.toISOString()
    });

    if (error) throw error;
    if (!data) {
      throw new Error('Invalid temperature stats response');
    }

    return data[0];
  } catch (error) {
    console.error('Error fetching temperature stats:', error);
    throw error;
  }
}

export async function getSensorTemperatureStats(userId: string, startDate: Date | string, endDate: Date | string): Promise<SensorTemperatureStats[]> {
  try {
    // Ensure we have proper Date objects
    const start = typeof startDate === 'string' ? new Date(startDate) : startDate;
    const end = typeof endDate === 'string' ? new Date(endDate) : endDate;

    // Validate dates
    if (!(start instanceof Date) || isNaN(start.getTime())) {
      throw new Error('Invalid start date');
    }
    if (!(end instanceof Date) || isNaN(end.getTime())) {
      throw new Error('Invalid end date');
    }

    const { data, error } = await supabase.rpc('get_sensor_temperature_stats', {
      p_user_id: userId,
      p_start_date: start.toISOString(),
      p_end_date: end.toISOString()
    });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching sensor temperature stats:', error);
    throw error;
  }
}

export async function getSensorReadingsForReport(
  userId: string,
  sensorId: string,
  startDate: Date | string,
  endDate: Date | string
): Promise<{ temperature: number; timestamp: string; }[]> {
  try {
    // Ensure we have proper Date objects
    const start = typeof startDate === 'string' ? new Date(startDate) : startDate;
    const end = typeof endDate === 'string' ? new Date(endDate) : endDate;
    
    // Validate dates
    if (!(start instanceof Date) || isNaN(start.getTime())) {
      throw new Error('Invalid start date');
    }
    if (!(end instanceof Date) || isNaN(end.getTime())) {
      throw new Error('Invalid end date');
    }
    
    // Ensure end date is after start date
    if (end < start) {
      throw new Error('End date must be after start date');
    }

    // Get bucketed readings
    const { data, error } = await supabase
      .rpc('get_bucketed_sensor_readings', {
        p_sensor_id: sensorId,
        p_start_date: start.toISOString(),
        p_end_date: end.toISOString()
      });

    if (error) throw error;
    
    // Transform readings
    return (data || []).map(reading => ({
        temperature: Number(reading.avg_temp),
        timestamp: reading.bucket_time
    }));
    
  } catch (error) {
    console.error('Error fetching sensor readings for report:', error);
    throw error;
  }
}
