import { Button } from 'ui';

function App() {
  return (
    <div className="App">
      <Button onClick={() => console.log('consumed button')}>UI button</Button>
    </div>
  );
}

export default App;
