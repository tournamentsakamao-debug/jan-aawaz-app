import React, { useEffect, useState } from 'react'
import { View, Alert } from 'react-native'
import { supabase } from '../../config/supabase'
import { useAuth } from '../../context/AuthContext'

export default function AdminDashboardScreen() {
  const { profile } = useAuth()
  const [settings, setSettings] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // CRITICAL: Double-check admin access server-side
    const verifyAdmin = async () => {
      if (profile?.email !== 'prounknown055@gmail.com') {
        Alert.alert('Access Denied', 'Admin panel is restricted')
        return navigation.goBack()
      }
      
      // Load current settings
      const { data, error } = await supabase
        .from('admin_settings')
        .select('*')
        .single()
      
      if (error) {
        console.error('Load settings error:', error)
        Alert.alert('Error', 'Could not load admin settings')
        return
      }
      setSettings(data)
      setLoading(false)
    }
    verifyAdmin()
  }, [profile])

  const toggleFeature = async (featureKey, newValue) => {
    try {
      const { error } = await supabase
        .from('admin_settings')
        .update({ 
          [featureKey]: newValue,
          updated_at: new Date().toISOString(),
          updated_by: profile.id
        })
        .eq('id', 1)
      
      if (error) throw error
      
      // Log the action
      await supabase.from('admin_logs').insert({        admin_id: profile.id,
        action_type: 'toggle',
        target_table: 'admin_settings',
        target_id: '1',
        old_values: { [featureKey]: settings[featureKey] },
        new_values: { [featureKey]: newValue },
        reason: `Toggled ${featureKey} to ${newValue}`,
      })
      
      setSettings(prev => ({ ...prev, [featureKey]: newValue }))
      Alert.alert('Success', `${featureKey} updated`)
    } catch (err) {
      console.error('Toggle error:', err)
      Alert.alert('Error', 'Failed to update setting')
    }
  }

  if (loading) return <View><Text>Loading admin panel...</Text></View>

  return (
    <View>
      {/* Maintenance Mode Toggle */}
      <ToggleSwitch
        label="🔧 Maintenance Mode"
        value={settings.app_maintenance_mode}
        onToggle={(val) => toggleFeature('app_maintenance_mode', val)}
      />
      
      {/* Protest Creation Toggle */}
      <ToggleSwitch
        label="✊ Allow Protest Groups"
        value={settings.protest_creation_enabled}
        onToggle={(val) => toggleFeature('protest_creation_enabled', val)}
      />
      
      {/* Payment Settings */}
      <Section title="💰 Payment Settings">
        <Input 
          label="UPI ID" 
          value={settings.payment_upi_id}
          onChange={(val) => toggleFeature('payment_upi_id', val)}
        />
        <Input 
          label="Amount (₹)" 
          value={settings.payment_amount.toString()}
          keyboardType="numeric"
          onChange={(val) => toggleFeature('payment_amount', parseFloat(val))}
        />
      </Section>
            {/* Admin Logs Viewer */}
      <Button title="📋 View Admin Logs" onPress={() => navigation.navigate('AdminLogs')} />
      
      {/* Emergency: Disable Entire App */}
      <Button 
        title="🚨 EMERGENCY: Disable All Features" 
        color="red"
        onPress={() => {
          Alert.alert(
            'Confirm Emergency Shutdown',
            'This will block all user access except admins. Continue?',
            [
              { text: 'Cancel', style: 'cancel' },
              { 
                text: 'SHUTDOWN', 
                style: 'destructive',
                onPress: () => toggleFeature('app_maintenance_mode', true)
              }
            ]
          )
        }} 
      />
    </View>
  )
}

// Helper Toggle Component
const ToggleSwitch = ({ label, value, onToggle }) => (
  <View style={{ flexDirection: 'row', justifyContent: 'space-between', padding: 16 }}>
    <Text>{label}</Text>
    <Switch value={value} onValueChange={onToggle} />
  </View>
)
