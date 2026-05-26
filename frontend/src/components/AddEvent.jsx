import { useEffect, useState } from 'react'

export default function AddEvent({ token, onEventAdded }) {
  const [form, setForm] = useState({
    title: '',
    short_description: '',
    full_description: '',
    location_id: '',
    date_start: '',
    date_end: '',
    category: '',
    image_url: '',
    registration_link: '',
    qr_code_data: '',
  })
  const [locations, setLocations] = useState([])
  const [loading, setLoading] = useState(false)
  const [conflictWarning, setConflictWarning] = useState('')

  useEffect(() => {
    async function loadLocations() {
      try {
        const response = await fetch('http://localhost:8000/locations')
        const data = await response.json()
        setLocations(data.data || [])
      } catch (error) {
        console.error('Could not load locations:', error)
      }
    }

    loadLocations()
  }, [])

  const handleChange = (e) => {
    setConflictWarning('')
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setConflictWarning('')

    try {
      const response = await fetch('http://localhost:8000/api/events/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      })

      if (response.status === 409) {
        setConflictWarning('Conflit detectat: locația este ocupată în intervalul selectat.')
        return
      }

      if (!response.ok) {
        throw new Error('Failed to add event')
      }

      const data = await response.json()
      onEventAdded(data)
      setForm({
        title: '',
        short_description: '',
        full_description: '',
        location_id: '',
        date_start: '',
        date_end: '',
        category: '',
        image_url: '',
        registration_link: '',
        qr_code_data: '',
      })
    } catch (error) {
      alert(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6">Add Event</h2>
      <form onSubmit={handleSubmit}>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="block text-gray-700">Title</label>
            <input
              name="title"
              value={form.title}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded"
              required
            />
          </div>
          <div>
            <label className="block text-gray-700">Category</label>
            <select
              name="category"
              value={form.category}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded"
              required
            >
              <option value="">Select</option>
              <option value="academic">Academic</option>
              <option value="sport">Sport</option>
              <option value="carieră">Carieră</option>
              <option value="voluntariat">Voluntariat</option>
            </select>
          </div>
          <div>
            <label className="block text-gray-700">Location</label>
            <select
              name="location_id"
              value={form.location_id}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded"
              required
            >
              <option value="">Select location</option>
              {locations.map((location) => (
                <option key={location.id} value={location.id}>
                  {location.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-gray-700">Image URL</label>
            <input
              name="image_url"
              value={form.image_url}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded"
            />
          </div>
          <div>
            <label className="block text-gray-700">Starts At</label>
            <input
              type="datetime-local"
              name="date_start"
              value={form.date_start}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded"
              required
            />
          </div>
          <div>
            <label className="block text-gray-700">Ends At</label>
            <input
              type="datetime-local"
              name="date_end"
              value={form.date_end}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded"
              required
            />
          </div>
        </div>

        <div className="mt-4">
          <label className="block text-gray-700">Short Description</label>
          <textarea
            name="short_description"
            value={form.short_description}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded"
            rows={3}
            required
          />
        </div>

        <div className="mt-4">
          <label className="block text-gray-700">Full Description</label>
          <textarea
            name="full_description"
            value={form.full_description}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded"
            rows={5}
            required
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2 mt-4">
          <div>
            <label className="block text-gray-700">Registration Link</label>
            <input
              name="registration_link"
              value={form.registration_link}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded"
            />
          </div>
          <div>
            <label className="block text-gray-700">QR Code Data</label>
            <input
              name="qr_code_data"
              value={form.qr_code_data}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded"
            />
          </div>
        </div>

        {conflictWarning && (
          <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {conflictWarning}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="mt-6 w-full bg-usv-blue text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          {loading ? 'Adding...' : 'Add Event'}
        </button>
      </form>
    </div>
  )
}
