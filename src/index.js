// React
var React = require('react')
var ReactDOM = require('react-dom')

// Google Maps
var ReactGMaps = require('react-gmaps')
var {Gmaps, Marker} = ReactGMaps

// Movie data
var movieData = require('./movies.json')
var theatres = require('./theatres.json')

// There should really be some JSON-formatted data in movies.json, instead of an empty array.
// I started writing this command to extract the data from the learn-sql workspace
// on C9, but it's not done yet :) You must have the csvtojson command installed for this to work. --done
// npm install -g csvtojson -- done
// sqlite3 -csv -header movies.sqlite3 'select "imdbID" as id, "title" from movies' | csvtojson --maxRowLength=0 > movies.json --done

// Firebase
var Rebase = require('re-base')
var base = Rebase.createClass({
  apiKey: "AIzaSyBHZ4HW4KWjOdqNqtlCIoMRySp-Zlb-J1k",   // replace with your Firebase application's API key -- done
  databaseURL: "https://buyflix-final-14c23.firebaseio.com/", // replace with your Firebase application's database URL --done
})

var MovieList = React.createClass({
  renderMovie: function(movie) {
    return (
      <Movie key={movie.id}
             movie={movie}
             movieClicked={this.props.movieClicked} />
    )
  },
  render: function() {
    return (
      <div className="movies col-sm-8">
        <div className="row">
          {this.props.movies.map(this.renderMovie)}
        </div>
      </div>
    )
  }
})

var Movie = React.createClass({
  movieClicked: function() {
    this.props.movieClicked(this.props.movie)
  },
  render: function() {
    return (
      <div className="col-sm-2">
        <div className="thumbnail">
          <img onClick={this.movieClicked} role="presentation" className="img-responsive" src={this.props.movie.poster} />
          <div className="caption">
            <h3>{this.props.movie.title}</h3>
            <p>{this.props.movie.genre}</p>
            <p>{this.props.movie.runtime}</p>
          </div>
        </div>
      </div>
    )
  }
})

var Header = React.createClass({
  render: function() {
    return (
      <div className="header row">
        <div className="col-sm-9">
          <h1>Buyflix</h1>
        </div>
        <div className="hello col-sm-3 text-center">
          <h2>Hi there!</h2>
        </div>
      </div>
    )
  }
})

var SortBar = React.createClass({
  viewChanged: function(view) {
    this.props.viewChanged(view)
  },
  render: function() {
    return (
      <div className="sort row">
        <div className="col-sm-12">
          <ul className="nav nav-pills">
            <li><a href="#" onClick={() => this.viewChanged('latest')}>Latest Releases</a></li>
            <li className="active"><a href="#" onClick={() => this.viewChanged('alpha')}>A-Z</a></li>
            <li><a href="#" onClick={() => this.viewChanged('map')}>Where to Watch</a></li>
            <li className="nav-text pull-right">{this.props.movieCount} movies</li>
          </ul>
        </div>
      </div>
    )
  }
})

var MovieDetails = React.createClass({
  movieWatched: function() {
    this.props.movieWatched(this.props.movie)
  },
  render: function() {
    return (
      <div className="details col-sm-4">
        <h3>
          <a href="#" className="btn btn-warning" onClick={this.movieWatched}> I watched it!</a>
        </h3>
        <div className="row">
          <div className="col-sm-6">
            <img role="presentation" className="poster img-responsive" src={this.props.movie.poster} />
          </div>
          <div className="col-sm-6">
            <h3>{this.props.movie.title}</h3>
            <p className="rating">{this.props.movie.rating}</p>
            <p><strong>Genre:</strong> {this.props.movie.genre}</p>
            <p><strong>Runtime:</strong> {this.props.movie.runtime}</p>
            <p><strong>Released:</strong> {this.props.movie.released}</p>
          </div>
        </div>
        <div className="row">
          <div className="col-sm-12">
            <h4>Summary</h4>
            <p>{this.props.movie.plot}</p>
            <h4>Cast</h4>
            <p>{this.props.movie.cast}</p>
          </div>
        </div>
      </div>
    )
  }
})

var NoCurrentMovie = React.createClass({
  render: function() {
    return (
      <div>
        <h3>Please select a movie from the list!</h3>
        <p><a href="#" className="btn btn-success" onClick={this.props.resetMovieListClicked}>Reset movie list!</a></p>
      </div>
    )
  }
})

var App = React.createClass({
  movieClicked: function(movie) {
    this.setState({
      currentMovie: movie
    })
  },
  movieWatched: function(movie) {
    var existingMovies = this.state.movies
    var moviesWithWatchedMovieRemoved = existingMovies.filter(function(existingMovie) {
      return existingMovie.id !== movie.id
    })
    this.setState({
      movies: moviesWithWatchedMovieRemoved,
      currentMovie: null
    })
  },
  resetMovieListClicked: function() {
    this.setState({
      movies: movieData.sort(this.movieCompareByReleased)
    })
  },
  viewChanged: function(view) {
    // View is either "latest" (movies sorted by release), "alpha" (movies
    // sorted A-Z), or "map" (the data visualized)
    // We should probably do the sorting and setting of movies in state here.
    // You should really look at https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort
    this.setState({
      currentView: view
    })
  },
  renderMovieDetails: function() {
    if (this.state.currentMovie == null) {
      return <NoCurrentMovie resetMovieListClicked={this.resetMovieListClicked} />
    } else {
      return <MovieDetails movie={this.state.currentMovie}
                           movieWatched={this.movieWatched} />
    }
  },
  renderMainSection: function() {
    if (this.state.currentView === 'map') {
      return (
        <div className="col-sm-12">
          <Gmaps width={'100%'}
       height={'480px'}
       lat={'41.9021988'}
       lng={'-87.6285782'}
       zoom={11}
       loadingMessage={'Map coming soon...'}
       params={{v: '3.exp', key: 'AIzaSyB3p_xQIXsFMDGLYNEiVkgW5fsVSUOd01c'}}>
    {theatres.map(function(place) {
      return <Marker key={place.id} lat={place.lat} lng={place.long} />
    })}
      </Gmaps>
        </div>

      )
    }else {
      return (
        <div>
          <MovieList movies={this.state.movies} movieClicked={this.movieClicked} />
          {this.renderMovieDetails()}
        </div>
      )
    }
  },

  movieCompareByTitle: function(movieA, movieB) {
    if (movieA.title < movieB.title) {
      return -1
    } else if (movieA.title > movieB.title) {
      return 1
    } else {
      return 0
    }
  },
  movieCompareByReleased: function(movieA, movieB) {
    if (movieA.released > movieB.released) {
      return -1
    } else if (movieA.released < movieB.released) {
      return 1
    } else {
      return 0
    }
  },
  getInitialState: function() {
    return {
      movies: movieData.sort(this.movieCompareByReleased),
      currentMovie: null
    }
  },
  componentDidMount: function() {
    base.syncState('/movies', {
      context: this,
      state: 'movies',
      asArray: true
    })
  },
  render: function() {
    return (
      <div>
        <Header currentUser={this.state.currentUser} />
        <SortBar movieCount={this.state.movies.length} viewChanged={this.viewChanged} />
        <div className="main row">
          {this.renderMainSection()}
        </div>
      </div>
    )
  }
})

ReactDOM.render(
  <App />,
  document.getElementById("app")
)
