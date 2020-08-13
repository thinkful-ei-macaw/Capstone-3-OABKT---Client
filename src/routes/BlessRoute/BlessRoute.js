import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import Button from '../../components/Button/Button';
import "./Bless.css";
import config from '../../config';
import TokenService from '../../services/token-service';
import AlertBox from '../../components/AlertBox/AlertBox';

class Bless extends Component {

  state = {
    curse: {},
    blessing: [],
    blessingMessage: '',
    blessingSent: false,
    alertBox: false,
    emojiSelected: false
  }

  handleGetCurse = () => { //Get a curse
    fetch(`${config.API_ENDPOINT}/curses`, {
      headers: {
        'authorization': `bearer ${TokenService.getAuthToken()}`,
      },
    })
      .then(res => {
        if (res.ok) {
          return res.json();
        }
      })
      .then(json => {
        console.log(json)
        this.setState({ curse: json })
      })
  }


  handleBlessCurse = (ev) => { //Bless a curse
    ev.preventDefault();
    const { emojiInput } = ev.target;
    const blessing_id = emojiInput.value
    const curseId = this.state.curse.curse_id
    fetch(`${config.API_ENDPOINT}/curses`, {
      method: 'PATCH',
      headers: {
        'authorization': `bearer ${TokenService.getAuthToken()}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        curse_id: curseId,
        blessing_id: blessing_id
      })
    })
      .then(res => {
        console.log(res)
        if (res.message !== undefined) {
        }
        return res.json();
      })
      .then(json => {
        console.log(json)
        this.handleGetCurse();
        this.setState({ blessingMessage: json, blessingSent: true, alertBox: true })

      })
      .catch(error => console.log(error)
      )
  }

  handleGetBlessingOptions = () => { // emojis
    fetch(`${config.API_ENDPOINT}/blessings`, {
      headers: {
        'authorization': `bearer ${TokenService.getAuthToken()},`
      }
    })
      .then(res => {
        if (res.ok) {
          return res.json()
        }
      })
      .then(json => {
        this.setState({ blessing: json })
      })
  }

  handleBlockUser = () => {
    const curseId = this.state.curse.curse_id
    fetch(`${config.API_ENDPOINT}/user`, {
      method: 'PATCH',
      headers: {
        'authorization': `bearer ${TokenService.getAuthToken()}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        curse_id: curseId
      })
    })
      .then(res => {
        console.log(res)
        if (res.message !== undefined) {
        }
        return res.json();
      })
      .then(json => {
        console.log(json)
        this.handleGetCurse();

      })
      .catch(error => console.log(error)
      )
  }

  handleBlessAnotherCurse = () => {
    this.setState({ alertBox: false })
    this.handleGetCurse();
  }

  componentDidMount() {
    this.handleGetCurse();
    this.handleGetBlessingOptions();
  }

  checkButton = () => {

    if (this.state.emojiSelected && this.state.curse !== 'No available curses' && this.state.blessingSent === false) {
      return <Button>Bless This Curse</Button>
    }
    else if (!this.state.emojiSelected) {
      return <Button onClick={() => this.handleBlessAnotherCurse()}>Different Curse</Button>
    }
    else {
      return <Button disabled>Bless This Curse</Button>
    }
  }

  render() {
    const curse = this.state.curse.curse;
    const blessingSent = this.state.blessingSent;
    console.log(curse)
    console.log(this.state.blessing)
    console.log(this.state.blessingMessage)




    if (this.state.blessingMessage === `You're out of blessings`) {
      return (
        <div>
          <h2>You are out of blessings</h2>
          <Link to="/dashboard">
            <Button>Go back</Button>
          </Link>
        </div>
      )
    }
    else {
      return (
        <div className='bless-container'>
          <h2 className='curse-bless-title'>Bless A Curse</h2>

          {this.state.curse === 'No available curses' ? <p className='curse-message'>No available curses</p> : <p className='curse-message'>{curse}</p>}
          <form onSubmit={this.handleBlessCurse} className="bless-form">
            {this.state.curse === 'No available curses' ? <select id="emojiDropdown" name="emojiInput" className="emoji-dropdown" disabled></select> :
              <select id="emojiDropdown" onChange={() => this.setState({ emojiSelected: true })} name="emojiInput" className="emoji-dropdown">
                <option>Select an Emoji</option>
                {this.state.blessing.map(blessing =>
                  <option key={blessing.blessing_id} value={blessing.blessing_id}>&#129311;</option>
                )}</select>}

            {this.state.blessingSent && this.state.alertBox ? <AlertBox function={this.handleBlessAnotherCurse} link={'Bless Another Curse'} message={`You have blessed this curse: ${curse}. `} /> : ''}
            {/* { this.state.curse === 'No available curses' ? <Button type='submit' disabled>Bless This Curse</Button> : <Button type='submit'>Bless This Curse</Button> } */}
            {this.checkButton()}
          </form>
          {this.state.curse === 'No available curses' ? <button className='blockbutton' onClick={this.handleBlockUser} disabled>No more from this user</button> : <button className='blockbutton' onClick={this.handleBlockUser}>No more from this user</button>}
        </div>

      )
    }

  }
}

export default Bless;