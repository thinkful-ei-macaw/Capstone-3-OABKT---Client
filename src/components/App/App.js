import React, { Component } from 'react';
import { Route, Redirect, Switch, withRouter } from 'react-router-dom';
import PrivateRoute from '../PrivateRoute/PrivateRoute';
import PublicOnlyRoute from '../PublicOnlyRoute/PublicOnlyRoute';
import LoginRoute from '../../routes/LoginRoute/LoginRoute';
import RegistrationRoute from '../../routes/RegistrationRoute/RegistrationRoute';
import './App.css';
import LandingPageRoute from '../../routes/LandingPageRoute/LandingPageRoute';
import Dashboard from '../../routes/Dashboard/DashboardRoute';
import CurseRoute from '../../routes/CurseRoute/CurseRoute';
import BlessRoute from '../../routes/BlessRoute/BlessRoute';
import config from '../../config';
import TokenService from '../../services/token-service';
import AppContext from '../../contexts/AppContext';
import { UserProvider } from '../../contexts/UserContext';
import NotFoundRoute from '../../routes/NotFoundRoute/NotFoundRoute';
import NewHeader from '../NewHeader/NewHeader';
import { CSSTransition } from 'react-transition-group';


const privateRoutes = [
  '/dashboard',
  '/bless',
  '/curse',
  '/'
];

const publicRoutes = [
  '/curse',
  '/login',
  '/register',
  '/'
];

class App extends Component {


  state = {
    quotes: {},
    user: { user: { limiter: 0, totalblessings: 0 }, blessedCurses: [] },
    loggedIn: false,
    blessedCurse: '',
    curse_id: '',
    curseIndex: 0,
    emoji: []
  };

  //(loggedin ? private : public).includes(URL)

  switchCheck = (match) => {
    return !(this.state.loggedIn ? privateRoutes : publicRoutes).includes(match.url);
  };

  handleGetQuote = () => { //to get random quotes from the server.
    fetch(`${config.API_ENDPOINT}/quotes`, {
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
        this.setState({ quotes: json });
      });
  };

  handleGetDashboardInfo = () => { // to get all the info needed to display on the user page (dashboard)
    fetch(`${config.API_ENDPOINT}/user`, {
      headers: {
        'authorization': `bearer ${TokenService.getAuthToken()}`,
      }
    })
      .then(res => {
        if (res.ok) {
          return res.json();
        }
      })
      .then(async json => {
        await this.setState({ user: json });
        if (this.state.user.blessedCurses.length > 0) {
          this.setState({ blessedCurse: json.blessedCurses[0].curse, curse_id: json.blessedCurses[0].curse_id });
        }
        else {
          this.setState({ blessedCurse: '', curse_id: '' });
        }
      })
      .catch(e => console.log(e));
  };

  handleDeleteCurse = (curse_id) => { // to delete a curse from the server after it's been blessed and seen by the user. 
    fetch(`${config.API_ENDPOINT}/curses`, {
      method: 'DELETE',
      headers: {
        'content-type': 'application/json',
        'authorization': `bearer ${TokenService.getAuthToken()}`
      },
      body: JSON.stringify({ curse_id })
    })
      .then(res => {
        if (res.ok) {
          return res.json();
        }
      })
      .then(async json => {
        if (this.state.curseIndex !== this.state.user.blessedCurses.length - 1) {
          this.setState({ curseIndex: this.state.curseIndex + 1 });
          this.setState({ blessedCurse: this.state.user.blessedCurses[this.state.curseIndex].curse, curse_id: this.state.user.blessedCurses[this.state.curseIndex].curse_id });
        }
        else {
          this.setState({ user: { user: this.state.user.user, blessedCurses: [] }, curseIndex: 0 });
        }
        // window.location.reload(false); // reload the page (at least for now) to get the next curse after deletion
      })
      .catch(e => console.log(e));
  };

  handleGetBlessingOptions = () => { // emojis
    fetch(`${config.API_ENDPOINT}/blessings`, {
      headers: {
        'authorization': `bearer ${TokenService.getAuthToken()},`
      }
    })
      .then(res => {
        if (res.ok) {
          return res.json();
        }
      })
      .then(json => {
        this.setState({ emoji: json });
      });
  };

  toggleLoggedIn = () => {
    this.setState({ loggedIn: !this.state.loggedIn });
  };

  async componentDidMount() {
    // this.setBlessedCurse();
    await this.handleGetBlessingOptions();
    await this.handleGetQuote();
    if (TokenService.hasAuthToken()) {
      await this.toggleLoggedIn();
      await this.handleGetDashboardInfo();
    }
  }

  setMainState = (object) => {
    this.setState(object);
  };

  render() {
    return (
      <AppContext.Provider
        value={{
          quotes: this.state.quotes,
          user: this.state.user,
          curseBlessed: this.state.curseBlessed,
          blessedCurse: this.state.blessedCurse,
          curse_id: this.state.curse_id,
          emoji: this.state.emoji,
          loggedIn: this.state.loggedIn,
          toggleLoggin: this.toggleLoggedIn,
          setMainState: this.setMainState,
          handleGetQuote: this.handleGetQuote,
          handleGetDashboardInfo: this.handleGetDashboardInfo,
          handleDeleteCurse: this.handleDeleteCurse,
          handleGetBlessingOptions: this.handleGetBlessingOptions
        }}
      >
        <UserProvider>
          <div className="App">
            <NewHeader toggleLoggedIn={this.toggleLoggedIn} loggedIn={this.state.loggedIn} name={this.state.user.user ? this.state.user.user.name : ''} />
            <main className="main">

              <PublicOnlyRoute exact path='/register'>
                {({ match }) => (
                  <CSSTransition in={match != null} timeout={500} classNames='page-transitions' unmountOnExit>
                    <div className='page-transitions'>
                      <RegistrationRoute />
                    </div>
                  </CSSTransition>
                )}
              </PublicOnlyRoute>
              <PublicOnlyRoute exact path='/login'>
                {({ match }) => (
                  <CSSTransition in={match != null} timeout={500} classNames='page-transitions' unmountOnExit>
                    <div className='page-transitions'>
                      <LoginRoute toggleLoggedIn={this.toggleLoggedIn} />
                    </div>
                  </CSSTransition>
                )}
              </PublicOnlyRoute>
              <Route exact path='/'>
                {({ match }) => (
                  <CSSTransition in={match != null} timeout={500} classNames='page-transitions' unmountOnExit>
                    <div className='page-transitions'>
                      <LandingPageRoute />
                    </div>
                  </CSSTransition>
                )}
              </Route>
              <PrivateRoute
                exact path='/dashboard'>
                {({ match }) => (
                  this.state.loggedIn ?
                    <CSSTransition in={match != null} timeout={500} classNames='page-transitions' unmountOnExit>
                      <div className='page-transitions'>
                        <Dashboard />
                      </div>
                    </CSSTransition>
                    : null
                )}
              </PrivateRoute>
              <Route exact path='/curse'>
                {({ match }) => (
                  <CSSTransition in={match != null} timeout={500} classNames='page-transitions' unmountOnExit>
                    <div className='page-transitions'>
                      <CurseRoute />
                    </div>
                  </CSSTransition>
                )}
              </Route>
              <PrivateRoute exact path='/bless'>
                {({ match }) => (
                  this.state.loggedIn ?
                    <CSSTransition in={match != null} timeout={500} classNames='page-transitions' unmountOnExit>
                      <div className='page-transitions'>
                        <BlessRoute />
                      </div>
                    </CSSTransition>
                    : null
                )}
              </PrivateRoute>
              <Route path="/*">
                {({ match }) => (
                  <CSSTransition in={this.switchCheck(match)} timeout={1000} classNames='error-page-transitions' unmountOnExit>
                    <div className='error-page-transitions '>
                      <NotFoundRoute />
                    </div>
                  </CSSTransition>
                )}
              </Route>
            </main>
          </div>
        </UserProvider>
      </AppContext.Provider>
    );
  }
}

export default App;




 // return (
    //   <AppContext.Provider
    //     value={{
    //       quotes: this.state.quotes,
    //       user: this.state.user,
    //       curseBlessed: this.state.curseBlessed,
    //       blessedCurse: this.state.blessedCurse,
    //       curse_id: this.state.curse_id,
    //       emoji: this.state.emoji,
    //       handleGetQuote: this.handleGetQuote,
    //       handleGetDashboardInfo: this.handleGetDashboardInfo,
    //       handleDeleteCurse: this.handleDeleteCurse,
    //       handleGetBlessingOptions: this.handleGetBlessingOptions
    //     }}
    //   >
    //     <UserProvider>
    //       <div className="App">
    //         <NewHeader toggleLoggedIn={this.toggleLoggedIn} />
    //         <main className="main">

    //           <PublicOnlyRoute exact path='/register'>
    //             {({ match }) => (
    //               <CSSTransition in={match != null} timeout={500} classNames='page-transitions' unmountOnExit>
    //                 <div className='page-transitions'>
    //                   <RegistrationRoute />
    //                 </div>
    //               </CSSTransition>
    //             )}
    //           </PublicOnlyRoute>
    //           <PublicOnlyRoute
    //             exact path='/login'
    //             toggleLoggedIn={this.toggleLoggedIn}>
    //             {({ match }) => (
    //               <CSSTransition in={match != null} timeout={500} classNames='page-transitions' unmountOnExit>
    //                 <div className='page-transitions'>
    //                   <LoginRoute />
    //                 </div>
    //               </CSSTransition>
    //             )}
    //           </PublicOnlyRoute>
    //           <Route exact path='/'>
    //             {({ match }) => (
    //               <CSSTransition in={match != null} timeout={500} classNames='page-transitions' unmountOnExit>
    //                 <div className='page-transitions'>
    //                   <LandingPageRoute />
    //                 </div>
    //               </CSSTransition>
    //             )}
    //           </Route>
    //           <PrivateRoute
    //             exact path='/dashboard'>
    //             {({ match }) => (
    //               <CSSTransition in={match != null} timeout={500} classNames='page-transitions' unmountOnExit>
    //                 <div className='page-transitions'>
    //                   <Dashboard />
    //                 </div>
    //               </CSSTransition>
    //             )}
    //           </PrivateRoute>
    //           <Route exact path='/curse'>
    //             {({ match }) => (
    //               <CSSTransition in={match != null} timeout={500} classNames='page-transitions' unmountOnExit>
    //                 <div className='page-transitions'>
    //                   <CurseRoute />
    //                 </div>
    //               </CSSTransition>
    //             )}
    //           </Route>
    //           <PrivateRoute exact path='/bless'>
    //             {({ match }) => (
    //               <CSSTransition in={match != null} timeout={500} classNames='page-transitions' unmountOnExit>
    //                 <div className='page-transitions'>
    //                   <BlessRoute />
    //                 </div>
    //               </CSSTransition>
    //             )}
    //           </PrivateRoute>
    //           <Route path="/*">
    //             {({ match }) => (
    //               <CSSTransition in={this.switchCheck(match)} timeout={500} classNames='page-transitions' unmountOnExit>
    //                 <div className='page-transitions'>
    //                   <NotFoundRoute />
    //                 </div>
    //               </CSSTransition>
    //             )}
    //           </Route>

    //         </main>
    //       </div>
    //     </UserProvider>
    //   </AppContext.Provider>
    // );