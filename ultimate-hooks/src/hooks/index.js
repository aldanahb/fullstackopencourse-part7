import { useState, useEffect } from 'react'
import axios from 'axios'

export const useResource = (baseUrl) => {

    const [resources, setResources] = useState([])
    
    let token = null
    const setToken = newToken => {
        token = `bearer ${newToken}`
    }

    const getAll = async () => {

        try {
            const response = await axios.get(baseUrl)
            setResources(response.data)
            return response.data

        } catch(error) {
            console.error("Error fetching resources:", error)
        }
    }

    useEffect(() => { getAll() }, [baseUrl])

    const create = async newObject => {
        const config = {
            headers: { Authorization: token },
        }

        const response = await axios.post(baseUrl, newObject, config)
        setResources(resources.concat(response.data))
        return response.data
    }

    const service = {
        create,
        setToken
    }

    return [resources, service]
}

