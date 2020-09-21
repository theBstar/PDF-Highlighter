import React, { useState, useRef } from 'react';
// import logo from './logo.svg';
import './App.css';
import { PdfLoader, PdfHighlighter, Tip, Highlight, AreaHighlight, Popup } from 'react-pdf-highlighter';

const parseIdFromHash = () =>
document.location.hash.slice("#highlight-".length);
const getNextId = () => String(Math.random()).slice(2);

const HighlightPopup = ({ comment }) =>
  comment.text ? (
    <div className="Highlight__popup">
      {comment.emoji} {comment.text}
    </div>
  ) : null;

function App() {
  const highlightsFromStorage = JSON.parse(localStorage.getItem('highlights'));
  const [state, setState] = useState({ highlights: highlightsFromStorage || [] });
  // not using the State type!

  // Jumping to highlight 

  // This function was defined and changed later! I'm not sure why it was used instead of a ref
  // let scrollViewerTo = (highlight: any) => { };
  // https://stackoverflow.com/questions/24841855/how-to-access-component-methods-from-outside-in-reactjs

  const pdfHighlighter = useRef(null)
  const getHighlightById = id => state.highlights.find(highlight => highlight.id === id)
  const scrollToHighlightFromHash = () => {
    const highlight = getHighlightById(parseIdFromHash());
    if (highlight) {
      pdfHighlighter.current.scrollTo(highlight);
    }
  };
  const { highlights } = state;
  function addHighlight(highlight) {
    const { highlights } = state;

    console.log("Saving highlight", highlight, highlight.content.text);
    const existingHighlights = JSON.parse(localStorage.getItem('highlights'));
    if (!existingHighlights) {
      localStorage.setItem('highlights', JSON.stringify([highlight]));
    } else {
      localStorage.setItem('highlights', JSON.stringify([...existingHighlights, highlight]));
    }

    setState({
      highlights: [{ ...highlight, id: getNextId() }, ...highlights]
    });
  }

  const deleteHighlight = (index) => {
    const highlights = state.highlights.filter((highlight, idx) => {
      if (index !== idx) {
        return highlight
      }
    })
    setState({ highlights })
  }

  function updateHighlight(highlightId, position, content) {
    console.log("Updating highlight", highlightId, position, content);

    setState({
      highlights: state.highlights.map(h => {
        return h.id === highlightId
          ? {
            ...h,
            position: { ...h.position, ...position },
            content: { ...h.content, ...content }
          }
          : h;
      })
    });
  }
  
  return (
    <div className="App" style={{ display: "flex", height: "100vh" }}>
        <PdfLoader url="" beforeLoad={<div>Loading...</div>}>
          {pdfDocument => (
            <PdfHighlighter
              pdfDocument={pdfDocument}
              ref={pdfHighlighter}
              scrollRef={scrollTo => {}}
              highlights={highlights}
              enableAreaSelection={event => event.altKey}
              onSelectionFinished={(
                position,
                content,
                hideTipAndSelection,
                transformSelection
              ) => (
                  <Tip
                    onOpen={transformSelection}
                    onConfirm={comment => {
                      addHighlight({ content, position, comment });

                      hideTipAndSelection();
                    }}
                  />
                )}
                highlightTransform={(
                  highlight,
                  index,
                  setTip,
                  hideTip,
                  viewportToScaled,
                  screenshot,
                  isScrolledTo
                ) => {
                  const isTextHighlight = !Boolean(
                    highlight.content && highlight.content.image
                  );
  
                  const component = isTextHighlight ? (
                    <Highlight
                      isScrolledTo={isScrolledTo}
                      position={highlight.position}
                      comment={highlight.comment}
                    />
                  ) : (
                      <AreaHighlight
                        highlight={highlight}
                        onChange={boundingRect => {
                          updateHighlight(
                            highlight.id,
                            { boundingRect: viewportToScaled(boundingRect) },
                            { image: screenshot(boundingRect) }
                          );
                        }}
                      />
                    );
  
                  return (
                    <Popup
                      popupContent={<HighlightPopup {...highlight} />}
                      onMouseOver={popupContent =>
                        {}
                      }
                      onMouseOut={hideTip}
                      key={index}
                      children={component}
                    />
                  );
                }}
            />
          )}
        </PdfLoader>

    </div>
  );
}

export default App;
