import './App.css'
import GearShiftKeyboard from './games/GearShiftKeyboard'
import GenderSliders from './games/GenderSliders'
import FanUnsubscribe from './games/FanUnsubscribe'
import MusicCaptcha from './games/MusicCaptcha'
import WeightyLogin from './games/WeightyLogin'

const games = [
  {
    id: 'gearshift',
    title: 'Gear Shift Keyboard',
    description: 'Type a message using this intuitive gear-selector interface.',
    component: <GearShiftKeyboard />,
  },
  {
    id: 'gender',
    title: 'Gender Selector',
    description: 'Please indicate your gender using the sliders provided.',
    component: <GenderSliders />,
  },
  {
    id: 'fan',
    title: 'Windy Unsubscribe',
    description: 'You can unsubscribe at any time. Just click the button.',
    component: <FanUnsubscribe />,
  },
  {
    id: 'captcha',
    title: 'Prove You\'re Human',
    description: 'A quick security check before you continue.',
    component: <MusicCaptcha />,
  },
  {
    id: 'weighty',
    title: 'Heavy Login',
    description: 'The longer your username, the heavier the field gets.',
    component: <WeightyLogin />,
  },
]

export default function App() {
  return (
    <div className="app">
      <header className="site-header">
        <h1>Bad UI <span>Playground</span></h1>
        <p>Digital experiences that are inherently wrong.</p>
      </header>
      <main className="games-grid">
        {games.map(game => (
          <article key={game.id} className="game-card">
            <div className="game-card-header">
              <h2>{game.title}</h2>
              <p>{game.description}</p>
            </div>
            <div className="game-card-body">
              {game.component}
            </div>
          </article>
        ))}
      </main>
    </div>
  )
}
