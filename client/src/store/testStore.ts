import { create } from 'zustand'

interface TestState {
  token: string
  actionLogin: (token: string) => void
}


const testStore = (set:any) => ({
  token: '',
    actionLogin: (token: string) => {
        localStorage.setItem('token', token)
        set({token: token})
    }
})

const useTestStore = create<TestState>(testStore)



export default useTestStore;