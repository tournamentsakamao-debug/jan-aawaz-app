import React, { useState, useEffect } from 'react'
import { View, StyleSheet, Alert } from 'react-native'
import MapView, { Marker, Polygon } from 'react-native-maps'
import * as Location from 'expo-location'
import { supabase } from '../../config/supabase'
import { useAuth } from '../../context/AuthContext'
import ProblemMarker from '../../components/ui/MapMarker'

export default function MapDashboardScreen({ navigation }) {
  const { profile } = useAuth()
  const [region, setRegion] = useState(null)
  const [problems, setProblems] = useState([])
  const [userLocation, setUserLocation] = useState(null)

  useEffect(() => {
    getCurrentLocation()
    loadProblems()
  }, [])

  const getCurrentLocation = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync()
    if (status !== 'granted') {
      Alert.alert('Permission denied', 'Location needed for area-based features')
      return
    }
    let location = await Location.getCurrentPositionAsync({})
    setUserLocation({
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
      latitudeDelta: 0.0922,
      longitudeDelta: 0.0421,
    })
    setRegion({
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
      latitudeDelta: 0.5, // Show district level
      longitudeDelta: 0.5,
    })
  }

  const loadProblems = async () => {
    if (!region) return
    // Convert map bounds to PostGIS box for query
    const { latitude, longitude, latitudeDelta, longitudeDelta } = region
    const { data, error } = await supabase
      .from('problems')
      .select(`
        id, title, description, category, status, 
        upvotes, is_anonymous, created_at,
        location, area_hierarchy,        profiles!inner(username, badge_name, badge_color)
      `)
      .eq('status', 'reported')
      .order('created_at', { ascending: false })
      .limit(50)
    
    if (error) {
      console.error('Load problems error:', error)
      return
    }
    setProblems(data || [])
  }

  const handleMapPress = async (e) => {
    if (!profile?.is_verified) {
      Alert.alert('Verify first', 'Complete profile verification to report problems')
      return
    }
    
    // Check weekly limit
    const { count, error: countErr } = await supabase
      .from('problems')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', profile.id)
      .gte('created_at', new Date(Date.now() - 7*24*60*60*1000).toISOString())
    
    if (countErr) {
      console.error('Limit check error:', countErr)
      return
    }
    
    if (count >= 1) {
      Alert.alert('Weekly limit reached', 'You can report 1 problem per week')
      return
    }
    
    // Navigate to report form with pre-filled location
    navigation.navigate('ReportProblem', {
      location: {
        latitude: e.nativeEvent.coordinate.latitude,
        longitude: e.nativeEvent.coordinate.longitude,
      }
    })
  }

  if (!region) return <View style={styles.loading}><Text>Loading map...</Text></View>

  return (
    <View style={styles.container}>
      <MapView        style={styles.map}
        region={region}
        onRegionChangeComplete={setRegion}
        onPress={handleMapPress}
        mapType="hybrid" // Shows 3D buildings where available
        showsUserLocation={true}
        showsMyLocationButton={true}
      >
        {/* User location marker */}
        {userLocation && (
          <Marker coordinate={userLocation} title="You" pinColor="#3B82F6" />
        )}
        
        {/* Problem markers */}
        {problems.map(problem => (
          <ProblemMarker 
            key={problem.id}
            problem={problem}
            onPress={() => navigation.navigate('ProblemDetail', { id: problem.id })}
          />
        ))}
        
        {/* Optional: Draw boundary if user selects area */}
        {/* <Polygon coordinates={[...]} fillColor="rgba(255,0,0,0.1)" /> */}
      </MapView>
      
      {/* Stats overlay */}
      <View style={styles.statsOverlay}>
        <Text style={styles.statText}>
          📍 {problems.length} issues nearby • 
          🗳️ {profile?.role === 'citizen' ? 'Vote Jan 1' : 'Manage'}
        </Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  statsOverlay: {
    position: 'absolute', bottom: 20, left: 20, right: 20,
    backgroundColor: 'rgba(0,0,0,0.7)', padding: 12, borderRadius: 12,
  },
  statText: { color: 'white', fontWeight: '600' },
})
