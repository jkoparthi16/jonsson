import React, { Component } from 'react'
import {
  AsyncStorage,
  StyleSheet,
  Linking,
  View,
  Dimensions,
  Clipboard,
  Image,
  ImageBackground,
  ActivityIndicator,
  StatusBar,
  TouchableHighlight,
} from 'react-native'

import { Container, Header, Content, Card, CardItem, Thumbnail, List, ListItem, Icon, Item, Input, Tab, Tabs, Text, Title, Button, Left, Body, Right, H1, H2, H3, } from 'native-base';

//import { CLIENT_ID, CLIENT_SECRET } from './config'

import LinkedInModal from 'react-native-linkedin'

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
    backgroundColor: '#ffffff',
  },
  backdrop: {
    height: 475,
    paddingTop: 60,
    width: null,
  },
  backdropView: {
    height: 230,
    width: 380,
    backgroundColor: 'rgba(0,0,0,0)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingLeft: 15,
    paddingRight: 15,
  },
  userContainer: {
    padding: 10,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  picture: {
    width: 200,
    height: 200,
    borderRadius: 100,
    resizeMode: 'cover',
    marginBottom: 15,
  },
  item: {
    flexDirection: 'row',
    marginVertical: 5,
  },
  label: {
    marginRight: 10,
  },
  value: {
    fontWeight: 'bold',
    marginLeft: 10,
  },
  linkedInContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  labelContainer: {
    flex: 0.7,
    alignItems: 'flex-end',
  },
  valueContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
})

export default class Login extends React.Component {

  state = {
    access_token: undefined,
    expires_in: undefined,
    refreshing: false,
  }

  constructor(props) {
    super(props)
    // StatusBar.setHidden(true)
    this.state = { isLoggedIn: false };
  }

  // This will see if the login token already exists - If it does, go to Main App Screen
  async componentWillMount() {
    let LOGIN_TOKEN = await AsyncStorage.getItem('LOGIN_TOKEN');
    if (LOGIN_TOKEN == null) {
      // DO nothing and continue login process
      console.log('Login token not found');
    }
    else {
      console.log('Login token has been found');
      let category = await this.chooseCategory();
      console.log(category);
      this.props.navigation.navigate("DrawerNavigator");
    }
  }

  async getUser({ access_token }) {
    this.setState({ refreshing: true })
    const baseApi = 'https://api.linkedin.com/v1/people/'
    const qs = { format: 'json' }
    const params = [
      'first-name',
      'last-name',
      'email-address',
      'summary',
      'picture-url',
      'id',
      'headline',
      'location:(name)',
      'picture-urls::(original)',
      'industry',
    ]

    const response = await fetch(`${baseApi}~:(${params.join(',')})?format=json`, {
      method: 'GET',
      headers: {
        Authorization: 'Bearer ' + access_token,
      },
    })
    const payload = await response.json()
    this.setState({
      ...payload,
      refreshing: false,
    })
    let value = this.state.pictureUrl
    if (value == null) {
      AsyncStorage.setItem('userPhoto', 'https://www.utdallas.edu/brand/files/Temoc_Orange.png')
    }
    else {
      AsyncStorage.setItem('userPhoto', this.state.pictureUrl)
    }
    AsyncStorage.setItem('lastName', this.state.lastName),
      AsyncStorage.setItem('firstName', this.state.firstName),
      AsyncStorage.setItem('email', this.state.emailAddress),
      AsyncStorage.setItem('headline', this.state.headline),
      AsyncStorage.setItem('userID', this.state.id),
      AsyncStorage.setItem('location', JSON.stringify(this.state.location)),
      AsyncStorage.setItem('industry', this.state.industry),
      AsyncStorage.setItem('LOGIN_TOKEN', "loggedIn"),
      AsyncStorage.getItem('loggedInStatus',
        (value) => {
          this.setState({ loggedInStatus: 'loggedIn' });
        });
    this.props.navigation.navigate('DrawerNavigator');
  }

  chooseCategory = () => {
    let category = 'student';
    return category;
  }

  renderItem(label, value) {
    return (
      <View style={styles.item}>
        <View style={styles.labelContainer}>
          <Text style={styles.label}>{label}</Text>
        </View>
        <View style={styles.valueContainer}>
          <Text style={styles.value}>{value}</Text>
        </View>
      </View>
    )
  }

  render() {
    const { emailAddress, pictureUrl, refreshing, firstName, lastName, summary, id, headline, location } = this.state;
    if (this.state.loggedInStatus === 'loggedIn') {
      this.props.navigation.navigate("HomeFeedStack")
    }
    return (
      <View style={styles.container}>
        <ImageBackground
          style={{ height: 475, width: 500 }}
          style={styles.backdrop}
          blurRadius={1}>
          <View alignItems='center'>
            <Image source={require('../images/Temoc_Orange.png')} style={{ height: 180, width: 150, paddingTop: 100 }}></Image>
            <Text style={{ fontSize: 32, fontWeight: '800', color: "#C75B12"}}>
              Jonsson Connect
            </Text>
            <Text style={{ textAlign: 'center', fontSize: 22, paddingHorizontal: 20, paddingVertical: 40, fontWeight: "bold" }}>
              {/* Begin exploring oppotunities only offered by the Jonsson School. */}
              The Erik Jonsson School of Engineering & Computer Science
            </Text>
            <Text style={{ textAlign: 'center', fontSize: 16, paddingHorizontal: 20, paddingVertical: 20, color: "#008542" }}>
              {/* Begin exploring oppotunities only offered by the Jonsson School. */}
              <Text style={{ fontSize: 22, color: "#008542", fontWeight: "bold" }}>
              FEARLESS
              </Text>
              {" "}engineering
              <Text style={{ color: "#008542", fontSize: 8}}>®</Text>
            </Text>
          </View>
        </ImageBackground>
        {!emailAddress &&
          !refreshing && (
            <View style={styles.linkedInContainer}>
              <LinkedInModal
                ref={ref => {
                  this.modal = ref
                }}
                linkText=""
                clientID="78ssigjikq1vry"
                clientSecret="w994WmnW8KCgOVts"
                redirectUri="https://engineering.utdallas.edu" // HAVE TO CHANGE
                onSuccess={
                  data => this.getUser(data)
                }
              />
            </View>
          )}
        <View style={styles.container}>
          <TouchableHighlight onPress={() => this.modal.open()}>
            <Button transparent onPress={() => this.modal.open()} style={{ width: 500 }} full light >
              <Image source={require('../images/linkedin-logo.png')} style={{ width: 25, height: 25 }}></Image>
              <Text style={{ color: '#c75b12', fontSize: 16 }}>
                Sign in with LinkedIn
              </Text>
            </Button>
          </TouchableHighlight>
          <Text style={{ fontSize: 10, fontWeight: '100' }}></Text>
          <TouchableHighlight>
            <Button transparent onPress={() => { Linking.openURL('https://engineering.utdallas.edu') }} style={{ width: 500 }} full light>
              <Image style={{ width: 25, height: 25 }} source={require('../images/Temoc_Secondary_Blue.png')}></Image>
              <Text style={{ color: '#c75b12', fontSize: 16 }}>
                Visit the Erik Jonsson School Website
              </Text>
            </Button>
          </TouchableHighlight>
          <TouchableHighlight style={{ paddingVertical: 40 }}>
            <Button transparent onPress={() => { Linking.openURL('https://utdallas.edu/privacy/') }} style={{ width: 500 }} full light>
              <Image style={{ width: 25, height: 25 }}></Image>
              <Text style={{ color: '#c75b12', fontSize: 16, fontWeight: "bold" }}>
                View Privacy Policy
              </Text>
            </Button>
          </TouchableHighlight>
        </View>
        <Text style={{ fontSize: 8, fontWeight: '100', position: "relative", paddingVertical: 20 }}>Copyright © 2018, The University of Texas at Dallas, all rights reserved.</Text>
      </View>
    )
  }
}
