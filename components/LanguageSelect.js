import { useState } from 'react'
import { WithContext as ReactTags } from 'react-tag-input';

export default function LanguageSelect(props) {
  const [languages, setLanguages] = useState([
    { id: 'Go', text: 'Go' },
    { id: 'Rust', text: 'Rust' },
    { id: 'C++', text: 'C++' },
  ])

  const [suggestions, setSuggestions] = useState([
    { id: 'Go', text: 'Go' },
    { id: 'Rust', text: 'Rust' },
    { id: 'C++', text: 'C++' },
  ])

  function handleTagAddition (tag) {
    const newLangs = [].concat(selected, tag);
    setSelected(newLangs)
  }

  function handleTagDeletion (index) {
    const newLangs = languages.slice(0)
    newLangs.splice(index, 1)
    setLanguages(newLangs)
  }

  return (
    <form>
      <h3>Languages</h3>
      <ReactTags
        labelText=""
        allowDragDrop={false}
        tags={languages}
        suggestions={suggestions}
        handleDelete={handleTagDeletion}
        handleAddition={handleTagAddition}
        inputFieldPosition="bottom"
      />
    </form>
  )
}
