"use client"
import { useState } from 'react';
import { 
  useLocalStorage, 
  useToggle, 
  useDebounce, 
  useOnlineStatus,
  useWindowSize,
  useKeyPress,
  useHover,
  useScrollPosition,
  usePermission,
  useSet,
  useQueue,
  useLongPress,
  useFetchAdvanced, 
  useUndoState, 
  useWebSocket, 
  useMediaRecorder,
  useIntersectionObserver,
  useIdleTimer
} from '../utils/imports.utils';

export default function DemoComponent() {


    const { data, loading, error, status, refetch, abort, clearCache } = 
        useFetchAdvanced('https://jsonplaceholder.typicode.com/posts/1', {
          immediate: true,
          enableCache: false,
          maxRetries: 2
        });
      
      // useUndoState example
      const { value, setValue, undo, redo, canUndo, canRedo } = 
        useUndoState('Type something...');
      
      // useWebSocket example (commented out for safety)
      // const { isConnected, messages, sendMessage } = 
      //   useWebSocket('wss://echo.websocket.org');
      
      // useMediaRecorder example
      const { recording, paused, audioUrl, startRecording, stopRecording, pauseRecording, resumeRecording } = 
        useMediaRecorder();
      
      // useIntersectionObserver example
      const { targetRef, isIntersecting } = 
        useIntersectionObserver({ threshold: 0.5 });
      
      // useIdleTimer example
      const { isIdle, remainingTime, reset } = 
        useIdleTimer(5000, {
          onIdle: () => console.log('User is idle'),
          onActive: () => console.log('User is active again')
        });
    

  // useLocalStorage example
  const [name, setName] = useLocalStorage('name', 'John Doe');
  
  const longPressProps = useLongPress(() => {
    alert('Long press detected!');
  });

  const notificationPermission = usePermission('notifications');

  const { set: mySet, add: addToSet, remove: removeFromSet, values: setValues } = useSet([1, 2, 3]);
  
  // useQueue example
  const { queue, enqueue, dequeue, peek: queuePeek } = useQueue([1, 2, 3]);
  // useFetch example
  
  // useToggle example
  const [isOn, toggleIsOn] = useToggle(false);
  
  // useDebounce example
  const [inputValue, setInputValue] = useState('');
  const debouncedValue = useDebounce(inputValue, 500);
  
  // useOnlineStatus example
  const isOnline = useOnlineStatus();
  
  // useWindowSize example
  const { width, height } = useWindowSize();
  
  // useKeyPress example
  const enterPressed = useKeyPress('Enter');
  
  // useHover example
  const [hoverRef, isHovered] = useHover();
  
  // useScrollPosition example
  const scrollPosition = useScrollPosition();

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h1>Next.js Custom Hooks Demo</h1>
      
      <section style={{ marginBottom: '30px', padding: '15px', border: '1px solid #ddd' }}>
        <h2>useLocalStorage</h2>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter your name"
        />
        <p>Hello, {name}!</p>
      </section>
      
      {/* <section style={{ marginBottom: '30px', padding: '15px', border: '1px solid #ddd' }}>
        <h2>useFetch</h2>
        {loading && <p>Loading...</p>}
        {error && <p>Error: {error}</p>}
        {data && <pre>{JSON.stringify(data, null, 2)}</pre>}
      </section> */}
{/*       
      <section style={{ marginBottom: '30px', padding: '15px', border: '1px solid #ddd' }}>
        <h2>useToggle</h2>
        <button onClick={()=>toggleIsOn()} style={{ padding: '10px 15px' }}>
          Toggle: {isOn ? 'ON' : 'OFF'}
        </button>
      </section> */}
      
      <section style={{ marginBottom: '30px', padding: '15px', border: '1px solid #ddd' }}>
        <h2>useDebounce</h2>
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Type something..."
          style={{ padding: '5px', width: '200px' }}
        />
        <p>Value: {inputValue}</p>
        <p>Debounced value: {debouncedValue}</p>
      </section>
      
      {/* <section style={{ marginBottom: '30px', padding: '15px', border: '1px solid #ddd' }}>
        <h2>useOnlineStatus</h2>
        <p>You are currently: {isOnline ? 'Online' : 'Offline'}</p>
      </section> */}
      
      <section style={{ marginBottom: '30px', padding: '15px', border: '1px solid #ddd' }}>
        <h2>useWindowSize</h2>
        <p>Window width: {width}px</p>
        <p>Window height: {height}px</p>
      </section>
      
      <section style={{ marginBottom: '30px', padding: '15px', border: '1px solid #ddd' }}>
        <h2>useKeyPress</h2>
        <p>Press the Enter key: {enterPressed ? 'Pressed!' : 'Not pressed'}</p>
      </section>
      
      {/* <section style={{ marginBottom: '30px', padding: '15px', border: '1px solid #ddd' }}>
        <h2>useHover</h2>
        <div
          ref={hoverRef}
          style={{
            padding: '20px',
            backgroundColor: isHovered ? '#e0f7fa' : '#f5f5f5',
            border: '1px solid #ccc',
            transition: 'background-color 0.3s'
          }}
        >
          Hover over me! {isHovered ? 'Thanks!' : ''}
        </div>
      </section> */}
      <section style={{ marginBottom: '30px', padding: '15px', border: '1px solid #ddd' }}>
        <h2>useLongPress</h2>
        <button {...longPressProps} style={{ padding: '10px 20px' }}>
          Press and hold me
        </button>
      </section>
      <section style={{ marginBottom: '30px', padding: '15px', border: '1px solid #ddd' }}>
        <h2>useSet</h2>
        <p>Values: {setValues.join(', ')}</p>
        <button onClick={() => addToSet(Math.floor(Math.random() * 100))}>
          Add Random Number
        </button>
        <button onClick={() => removeFromSet(setValues[0])} disabled={setValues.length === 0}>
          Remove First
        </button>
      </section>

      <section style={{ marginBottom: '30px', padding: '15px', border: '1px solid #ddd' }}>
        <h2>useQueue</h2>
        <p>Queue: {queue.join(', ')}</p>
        <p>Next to dequeue: {queuePeek()}</p>
        <button onClick={() => enqueue(Math.floor(Math.random() * 100))}>
          Enqueue Random Number
        </button>
        <button onClick={dequeue} disabled={queue.length === 0}>
          Dequeue
        </button>
      </section>

      <section style={{ marginBottom: '30px', padding: '15px', border: '1px solid #ddd' }}>
        <h2>usePermission</h2>
        <p>Notification permission: {notificationPermission}</p>
      </section>
      
      <section style={{ marginBottom: '30px', padding: '15px', border: '1px solid #ddd' }}>
        <h2>useScrollPosition</h2>
        <p>Current scroll position: {scrollPosition}px</p>
      </section>

      <div style={{ padding: '20px', maxWidth: '1000px', margin: '0 auto' }}>
      <h1>Advanced Next.js Custom Hooks</h1>
      
      <section style={{ marginBottom: '30px', padding: '15px', border: '1px solid #ddd' }}>
        <h2>useFetchAdvanced</h2>
        <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
          <button onClick={() => refetch()} disabled={loading}>
            Refetch
          </button>
          <button onClick={abort} disabled={!loading}>
            Abort
          </button>
          <button onClick={clearCache}>
            Clear Cache
          </button>
        </div>
        <p>Status: {status}</p>
        {loading && <p>Loading...</p>}
        {error && <p style={{ color: 'red' }}>Error: {error}</p>}
        {data && (
          <div>
            <h3>{data.title}</h3>
            <p>{data.body}</p>
          </div>
        )}
      </section>
      
      <section style={{ marginBottom: '30px', padding: '15px', border: '1px solid #ddd' }}>
        <h2>useUndoState</h2>
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          style={{ marginRight: '10px', padding: '5px' }}
        />
        <button onClick={undo} disabled={!canUndo} style={{ marginRight: '5px' }}>
          Undo
        </button>
        <button onClick={redo} disabled={!canRedo}>
          Redo
        </button>
      </section>
      
      <section style={{ marginBottom: '30px', padding: '15px', border: '1px solid #ddd' }}>
        <h2>useMediaRecorder</h2>
        <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
          <button 
            onClick={startRecording} 
            disabled={recording}
            style={{ backgroundColor: recording ? '#ccc' : '#4CAF50', color: 'white' }}
          >
            Start Recording
          </button>
          <button 
            onClick={stopRecording} 
            disabled={!recording}
            style={{ backgroundColor: '#f44336', color: 'white' }}
          >
            Stop Recording
          </button>
          <button 
            onClick={pauseRecording} 
            disabled={!recording || paused}
            style={{ backgroundColor: '#FF9800', color: 'white' }}
          >
            Pause
          </button>
          <button 
            onClick={resumeRecording} 
            disabled={!recording || !paused}
            style={{ backgroundColor: '#2196F3', color: 'white' }}
          >
            Resume
          </button>
        </div>
        <p>Status: {recording ? (paused ? 'Paused' : 'Recording...') : 'Stopped'}</p>
        {audioUrl && (
          <div>
            <audio controls src={audioUrl} style={{ marginTop: '10px' }} />
          </div>
        )}
      </section>
      
      <section style={{ marginBottom: '30px', padding: '15px', border: '1px solid #ddd' }}>
        <h2>useIntersectionObserver</h2>
        <div style={{ height: '150px', overflow: 'scroll', border: '1px solid #ccc' }}>
          <div style={{ height: '300px', padding: '20px' }}>
            Scroll down to see the observed element...
            <div
              ref={targetRef}
              style={{
                marginTop: '200px',
                padding: '20px',
                backgroundColor: isIntersecting ? '#4CAF50' : '#f44336',
                color: 'white',
                transition: 'background-color 0.3s'
              }}
            >
              {isIntersecting ? 'Element is in view!' : 'Element is not in view'}
            </div>
          </div>
        </div>
      </section>
      
      <section style={{ marginBottom: '30px', padding: '15px', border: '1px solid #ddd' }}>
        <h2>useIdleTimer</h2>
        <p>User status: {isIdle ? 'Idle' : 'Active'}</p>
        <p>Time until idle: {Math.ceil(remainingTime / 1000)} seconds</p>
        <button onClick={reset}>Reset Timer</button>
        <p style={{ fontSize: '14px', color: '#666', marginTop: '10px' }}>
          Move your mouse or press any key to reset the idle timer (5 seconds)
        </p>
      </section>
    </div>
    </div>
  );
}