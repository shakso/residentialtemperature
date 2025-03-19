import { supabase } from '../supabase';

export async function getUserProfile(userId: string) {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();
    
    if (error) throw error;
    return data || { id: userId };
  } catch (error) {
    console.error('Error fetching user profile:', error);
    throw error;
  }
}

export async function updateUserProfile(userId: string, data: any) {
  try {
    const { data: updatedData, error } = await supabase
      .from('profiles')
      .update(data)
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
