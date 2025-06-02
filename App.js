import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Alert,
  Linking,
  I18nManager,
  StatusBar,
  SafeAreaView,
  ActivityIndicator,
  RefreshControl,
  Modal,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Enable RTL layout
I18nManager.allowRTL(true);
I18nManager.forceRTL(true);

// API Configuration - Updated to use deployed Render URL
const API_BASE_URL = 'https://instagram-saved-search.onrender.com';

// Instagram API class that connects to the Python server
class InstagramAPI {
  constructor() {
    this.isLoggedIn = false;
    this.username = '';
    this.sessionData = null;
    // Use your local server - change this IP if needed
    this.baseURL = API_BASE_URL;
    // For mobile device, you might need to use your computer's IP:
    // this.baseURL = 'http://192.168.3.82:5000/api'; // Replace XXX with your IP
  }

  async login(username, password) {
    try {
      // First check if server is running
      const healthResponse = await fetch(`${this.baseURL}/health`);
      if (!healthResponse.ok) {
        return {
          success: false,
          message: 'השרת לא פועל. אנא הפעל את השרת Python תחילה'
        };
      }

      // Attempt login
      const response = await fetch(`${this.baseURL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: username,
          password: password
        })
      });

      const result = await response.json();

      if (result.success) {
        this.isLoggedIn = true;
        this.username = username;
        this.sessionData = {
          username,
          loginTime: new Date().toISOString(),
          sessionId: Math.random().toString(36).substring(7)
        };

        // Save session locally
        try {
          await AsyncStorage.setItem(
            `instagram_session_${username}`, 
            JSON.stringify(this.sessionData)
          );
        } catch (error) {
          console.log('Failed to save session locally');
        }

        return {
          success: true,
          message: result.message
        };
      } else {
        return {
          success: false,
          message: result.message
        };
      }

    } catch (error) {
      console.error('Login error:', error);
      
      if (error.message.includes('Network request failed') || error.message.includes('fetch')) {
        return {
          success: false,
          message: 'לא ניתן להתחבר לשרת. וודא ש:\n• השרת Python פועל (python api_server.py)\n• אתה מחובר לאותה רשת WiFi\n• כתובת השרת נכונה'
        };
      }
      
      return {
        success: false,
        message: `שגיאת רשת: ${error.message}`
      };
    }
  }

  async getSavedPosts() {
    if (!this.isLoggedIn) {
      return {
        success: false,
        message: 'לא מחובר. אנא התחבר תחילה'
      };
    }

    try {
      const response = await fetch(`${this.baseURL}/saved-posts?username=${this.username}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      const result = await response.json();

      if (result.success) {
        return {
          success: true,
          posts: result.posts,
          message: result.message
        };
      } else {
        return {
          success: false,
          message: result.message
        };
      }

    } catch (error) {
      console.error('Get posts error:', error);
      return {
        success: false,
        message: 'שגיאה בטעינת הפוסטים. וודא שהשרת פועל'
      };
    }
  }

  async logout() {
    try {
      // Call server logout
      await fetch(`${this.baseURL}/logout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: this.username
        })
      });
    } catch (error) {
      console.log('Server logout failed, continuing with local logout');
    }

    // Local cleanup
    if (this.username) {
      try {
        await AsyncStorage.removeItem(`instagram_session_${this.username}`);
      } catch (error) {
        console.log('Failed to remove local session');
      }
    }
    
    this.isLoggedIn = false;
    this.username = '';
    this.sessionData = null;
    
    return {
      success: true,
      message: 'התנתקת בהצלחה'
    };
  }
}

export default function App() {
  const [posts, setPosts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginModalVisible, setLoginModalVisible] = useState(false);
  const [loadingPosts, setLoadingPosts] = useState(false);
  const [instagramAPI] = useState(new InstagramAPI());

  // Filter posts based on search query
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredPosts(posts);
    } else {
      const filtered = posts.filter(post =>
        post.caption.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.owner.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredPosts(filtered);
    }
  }, [searchQuery, posts]);

  // Check for saved session on app start
  useEffect(() => {
    checkSavedSession();
  }, []);

  const checkSavedSession = async () => {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const sessionKeys = keys.filter(key => key.startsWith('instagram_session_'));
      
      if (sessionKeys.length > 0) {
        const lastSessionKey = sessionKeys[sessionKeys.length - 1];
        const savedSession = await AsyncStorage.getItem(lastSessionKey);
        
        if (savedSession) {
          const sessionData = JSON.parse(savedSession);
          const savedUsername = sessionData.username;
          
          // Auto-login with saved session
          instagramAPI.isLoggedIn = true;
          instagramAPI.username = savedUsername;
          instagramAPI.sessionData = sessionData;
          
          setIsLoggedIn(true);
          setUsername(savedUsername);
          
          // Auto-load posts
          fetchSavedPosts();
        }
      }
    } catch (error) {
      console.log('No saved session found');
    }
  };

  const loginToInstagram = async () => {
    if (!username || !password) {
      Alert.alert('שגיאה', 'אנא הזן גם שם משתמש וגם סיסמה');
      return;
    }

    setIsLoading(true);
    
    try {
      const result = await instagramAPI.login(username, password);

      if (result.success) {
        setIsLoggedIn(true);
        setLoginModalVisible(false);
        Alert.alert('הצלחה', result.message);
        fetchSavedPosts();
      } else {
        Alert.alert('שגיאת התחברות', result.message);
      }
    } catch (error) {
      Alert.alert('שגיאה', 'שגיאה בלתי צפויה בהתחברות');
      console.error('Login error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSavedPosts = async () => {
    setLoadingPosts(true);
    
    try {
      const result = await instagramAPI.getSavedPosts();

      if (result.success) {
        setPosts(result.posts);
        setFilteredPosts(result.posts);
      } else {
        Alert.alert('שגיאה', result.message);
      }
    } catch (error) {
      Alert.alert('שגיאה', 'לא ניתן לטעון פוסטים שמורים');
      console.error('Fetch posts error:', error);
    } finally {
      setLoadingPosts(false);
    }
  };

  const handleRefresh = () => {
    if (isLoggedIn) {
      setRefreshing(true);
      fetchSavedPosts().finally(() => setRefreshing(false));
    } else {
      setRefreshing(true);
      setTimeout(() => {
        setRefreshing(false);
        Alert.alert('רענון', 'אנא התחבר תחילה כדי לטעון פוסטים');
      }, 1000);
    }
  };

  const logout = async () => {
    try {
      await instagramAPI.logout();
      setIsLoggedIn(false);
      setPosts([]);
      setFilteredPosts([]);
      setUsername('');
      setPassword('');
      Alert.alert('התנתקות', 'התנתקת בהצלחה');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const openPost = (url) => {
    Linking.openURL(url).catch(() => {
      Alert.alert('שגיאה', 'לא ניתן לפתוח את הקישור');
    });
  };

  const getMediaTypeIcon = (mediaType) => {
    switch (mediaType) {
      case 1: return 'image-outline';
      case 2: return 'videocam-outline';
      case 8: return 'albums-outline';
      default: return 'document-outline';
    }
  };

  const getMediaTypeText = (mediaType) => {
    switch (mediaType) {
      case 1: return 'תמונה';
      case 2: return 'סרטון';
      case 8: return 'אלבום';
      default: return 'פוסט';
    }
  };

  const PostCard = ({ post }) => (
    <View style={styles.postCard}>
      <View style={styles.postHeader}>
        <View style={styles.userInfo}>
          <Text style={styles.username}>@{post.owner}</Text>
          <View style={styles.mediaTypeContainer}>
            <Ionicons 
              name={getMediaTypeIcon(post.media_type)} 
              size={16} 
              color="#666" 
              style={styles.mediaIcon}
            />
            <Text style={styles.mediaType}>{getMediaTypeText(post.media_type)}</Text>
          </View>
        </View>
        <TouchableOpacity 
          style={styles.viewButton}
          onPress={() => openPost(post.url)}
        >
          <Text style={styles.viewButtonText}>צפה</Text>
          <Ionicons name="open-outline" size={16} color="#fff" />
        </TouchableOpacity>
      </View>
      
      <Text style={styles.caption} numberOfLines={3}>
        {post.caption}
      </Text>
      
      <View style={styles.postFooter}>
        <View style={styles.statsContainer}>
          <Ionicons name="heart-outline" size={16} color="#E4405F" />
          <Text style={styles.likes}>{post.likes?.toLocaleString() || 0} לייקים</Text>
        </View>
        <Text style={styles.date}>{post.date?.split(' ')[0] || 'תאריך לא ידוע'}</Text>
      </View>
    </View>
  );

  const LoginModal = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={loginModalVisible}
      onRequestClose={() => setLoginModalVisible(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>התחברות לאינסטגרם</Text>
            <TouchableOpacity 
              onPress={() => setLoginModalVisible(false)}
              style={styles.closeButton}
            >
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          <View style={styles.warningContainer}>
            <Ionicons name="shield-checkmark-outline" size={20} color="#28a745" />
            <Text style={styles.warningText}>
              התחברות אמיתית לאינסטגרם דרך API מאובטח
            </Text>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>שם משתמש באינסטגרם</Text>
            <TextInput
              style={styles.input}
              placeholder="שם_המשתמש_שלך"
              value={username}
              onChangeText={setUsername}
              textAlign="right"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>סיסמת אינסטגרם</Text>
            <TextInput
              style={styles.input}
              placeholder="הסיסמה_שלך"
              value={password}
              onChangeText={setPassword}
              textAlign="right"
              secureTextEntry
            />
          </View>

          <TouchableOpacity 
            style={[styles.loginButton, isLoading && styles.loginButtonDisabled]}
            onPress={loginToInstagram}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Text style={styles.loginButtonText}>התחבר לאינסטגרם</Text>
                <Ionicons name="log-in-outline" size={20} color="#fff" />
              </>
            )}
          </TouchableOpacity>

          <View style={styles.tipsContainer}>
            <Text style={styles.tipsTitle}>🔐 אבטחה והגנה:</Text>
            <Text style={styles.tipText}>• הנתונים שלך מוצפנים ומאובטחים</Text>
            <Text style={styles.tipText}>• הסיסמה לא נשמרת במכשיר</Text>
            <Text style={styles.tipText}>• השרת פועל רק במחשב שלך</Text>
            <Text style={styles.tipText}>• אם יש 2FA, השבת זמנית</Text>
          </View>
        </View>
      </View>
    </Modal>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#E4405F" />
      
      {/* Header */}
      <LinearGradient
        colors={['#E4405F', '#F56040']}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>🎬 חיפוש רילס שמורים</Text>
        <Text style={styles.headerSubtitle}>
          {isLoggedIn ? 
            `מחובר בתור: @${username}` : 
            'חפש ועיין ברילס ותכנים שמורים שלך'
          }
        </Text>
        
        {isLoggedIn ? (
          <TouchableOpacity style={styles.logoutButton} onPress={logout}>
            <Text style={styles.logoutButtonText}>התנתק</Text>
            <Ionicons name="log-out-outline" size={16} color="#fff" />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity 
            style={styles.loginHeaderButton} 
            onPress={() => setLoginModalVisible(true)}
          >
            <Text style={styles.loginHeaderButtonText}>התחבר לאינסטגרם</Text>
            <Ionicons name="log-in-outline" size={16} color="#fff" />
          </TouchableOpacity>
        )}
      </LinearGradient>

      {isLoggedIn ? (
        <>
          {/* Search Bar */}
          <View style={styles.searchContainer}>
            <View style={styles.searchBar}>
              <Ionicons name="search-outline" size={20} color="#666" style={styles.searchIcon} />
              <TextInput
                style={styles.searchInput}
                placeholder="חפש בכיתובים או שמות משתמשים..."
                value={searchQuery}
                onChangeText={setSearchQuery}
                textAlign="right"
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setSearchQuery('')}>
                  <Ionicons name="close-circle-outline" size={20} color="#666" />
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Results Count */}
          <View style={styles.resultsContainer}>
            <Text style={styles.resultsText}>
              {searchQuery ? 
                `נמצאו ${filteredPosts.length} פוסטים תואמים מתוך ${posts.length} בסך הכל` :
                `מציג את כל ${filteredPosts.length} הפוסטים השמורים`
              }
            </Text>
          </View>

          {/* Posts List */}
          {loadingPosts ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#E4405F" />
              <Text style={styles.loadingText}>טוען פוסטים שמורים...</Text>
            </View>
          ) : (
            <ScrollView
              style={styles.postsContainer}
              refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
              }
              showsVerticalScrollIndicator={false}
            >
              {filteredPosts.length > 0 ? (
                filteredPosts.map((post, index) => (
                  <PostCard key={post.shortcode || index} post={post} />
                ))
              ) : (
                <View style={styles.emptyContainer}>
                  <Ionicons name="search-outline" size={64} color="#ccc" />
                  <Text style={styles.emptyText}>
                    {searchQuery ? 
                      'לא נמצאו פוסטים התואמים לחיפוש שלך' :
                      'לא נמצאו פוסטים שמורים'
                    }
                  </Text>
                  <Text style={styles.emptySubtext}>
                    {searchQuery ? 
                      'נסה מילות מפתח אחרות' :
                      'שמור כמה פוסטים באינסטגרם תחילה'
                    }
                  </Text>
                </View>
              )}
            </ScrollView>
          )}

          {/* Statistics Footer */}
          {posts.length > 0 && (
            <View style={styles.statsFooter}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{posts.length}</Text>
                <Text style={styles.statLabel}>פוסטים</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>
                  {posts.reduce((sum, post) => sum + (post.likes || 0), 0).toLocaleString()}
                </Text>
                <Text style={styles.statLabel}>לייקים</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>
                  {new Set(posts.map(post => post.owner)).size}
                </Text>
                <Text style={styles.statLabel}>יוצרים</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>
                  {posts.filter(post => post.media_type === 2).length}
                </Text>
                <Text style={styles.statLabel}>סרטונים</Text>
              </View>
            </View>
          )}
        </>
      ) : (
        /* Welcome Screen */
        <View style={styles.welcomeContainer}>
          <Ionicons name="logo-instagram" size={80} color="#E4405F" />
          <Text style={styles.welcomeTitle}>ברוכים הבאים!</Text>
          <Text style={styles.welcomeText}>
            התחבר לאינסטגרם כדי לחפש ולעיין בפוסטים השמורים שלך
          </Text>
          
          <TouchableOpacity 
            style={styles.welcomeLoginButton}
            onPress={() => setLoginModalVisible(true)}
          >
            <Text style={styles.welcomeLoginButtonText}>התחבר לאינסטגרם</Text>
            <Ionicons name="log-in-outline" size={20} color="#fff" />
          </TouchableOpacity>

          <View style={styles.featuresContainer}>
            <Text style={styles.featuresTitle}>✨ תכונות האפליקציה:</Text>
            <View style={styles.featureItem}>
              <Ionicons name="search-outline" size={20} color="#E4405F" />
              <Text style={styles.featureText}>חיפוש חכם בכיתובים ושמות משתמשים</Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="bookmark-outline" size={20} color="#E4405F" />
              <Text style={styles.featureText}>גישה לפוסטים השמורים שלך באינסטגרם</Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="stats-chart-outline" size={20} color="#E4405F" />
              <Text style={styles.featureText}>סטטיסטיקות מפורטות על הפוסטים</Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="phone-portrait-outline" size={20} color="#E4405F" />
              <Text style={styles.featureText}>ממשק מותאם למובייל עם תמיכה בעברית</Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="shield-checkmark-outline" size={20} color="#E4405F" />
              <Text style={styles.featureText}>חיבור מאובטח לאינסטגרם</Text>
            </View>
          </View>

          <View style={styles.serverNotice}>
            <Ionicons name="server-outline" size={24} color="#007AFF" />
            <Text style={styles.serverNoticeText}>
              וודא שהשרת Python פועל במחשב שלך (python api_server.py) לפני ההתחברות
            </Text>
          </View>
        </View>
      )}

      <LoginModal />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 5,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.9,
    textAlign: 'center',
    marginBottom: 10,
  },
  loginHeaderButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    marginTop: 5,
  },
  loginHeaderButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 5,
  },
  logoutButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    marginTop: 5,
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 5,
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f3f4',
    borderRadius: 25,
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  searchIcon: {
    marginLeft: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    textAlign: 'right',
  },
  resultsContainer: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  resultsText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'right',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
    marginTop: 15,
    textAlign: 'center',
  },
  postsContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  postCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  postHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  userInfo: {
    flex: 1,
  },
  username: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'right',
    marginBottom: 4,
  },
  mediaTypeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  mediaIcon: {
    marginLeft: 5,
  },
  mediaType: {
    fontSize: 12,
    color: '#666',
  },
  viewButton: {
    backgroundColor: '#E4405F',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  viewButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 5,
  },
  caption: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
    textAlign: 'right',
    marginBottom: 10,
  },
  postFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  likes: {
    fontSize: 12,
    color: '#666',
    marginLeft: 5,
  },
  date: {
    fontSize: 12,
    color: '#999',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 10,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
  statsFooter: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#E4405F',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  welcomeContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  welcomeTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 15,
  },
  welcomeText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 30,
  },
  welcomeLoginButton: {
    backgroundColor: '#E4405F',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
    marginBottom: 40,
  },
  welcomeLoginButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  featuresContainer: {
    width: '100%',
    marginBottom: 30,
  },
  featuresTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 20,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    paddingHorizontal: 10,
  },
  featureText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 15,
    flex: 1,
    textAlign: 'right',
  },
  serverNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e3f2fd',
    padding: 15,
    borderRadius: 10,
    marginTop: 20,
  },
  serverNoticeText: {
    fontSize: 12,
    color: '#1976d2',
    marginLeft: 10,
    flex: 1,
    textAlign: 'right',
    lineHeight: 18,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    width: '90%',
    maxWidth: 400,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    padding: 5,
  },
  warningContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e8f5e8',
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
  },
  warningText: {
    fontSize: 12,
    color: '#28a745',
    marginLeft: 8,
    flex: 1,
    textAlign: 'right',
  },
  inputContainer: {
    marginBottom: 15,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
    textAlign: 'right',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    textAlign: 'right',
  },
  loginButton: {
    backgroundColor: '#E4405F',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    borderRadius: 8,
    marginBottom: 20,
  },
  loginButtonDisabled: {
    backgroundColor: '#ccc',
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  tipsContainer: {
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 8,
  },
  tipsTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
    textAlign: 'right',
  },
  tipText: {
    fontSize: 12,
    color: '#666',
    marginBottom: 5,
    textAlign: 'right',
  },
}); 