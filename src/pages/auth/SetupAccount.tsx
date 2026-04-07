/**
 * Setup Account Page
 *
 * Post-payment account creation flow.
 * After paying on Lovable, clients are redirected here with a one-time token.
 * They can create their account via Google OAuth, Microsoft OAuth, or password.
 */

import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle, CheckCircle2, Loader2 } from 'lucide-react'

const API_URL = import.meta.env.VITE_API_URL || 'https://app.helloariel.ai'

export default function SetupAccount() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { setAuth } = useAuth()

  const token = searchParams.get('token')
  const urlError = searchParams.get('error')
  const urlErrorDetail = searchParams.get('detail')
  const accessTokenParam = searchParams.get('access_token')
  const refreshTokenParam = searchParams.get('refresh_token')
  const setupComplete = searchParams.get('setup_complete')

  const [tokenData, setTokenData] = useState<{
    email: string
    first_name: string
    last_name: string
  } | null>(null)
  const [isValidating, setIsValidating] = useState(false)
  const [tokenValid, setTokenValid] = useState(false)
  const [error, setError] = useState('')
  const [showPasswordForm, setShowPasswordForm] = useState(false)
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isCreating, setIsCreating] = useState(false)
  const [passwordStrength, setPasswordStrength] = useState({
    hasLength: false,
    hasNumber: false,
    hasUpper: false,
    hasLower: false,
  })

  // Handle OAuth callback (tokens in URL)
  useEffect(() => {
    if (accessTokenParam && refreshTokenParam && setupComplete === 'true') {
      // Save tokens and redirect to dashboard
      setAuth({
        access_token: accessTokenParam,
        refresh_token: refreshTokenParam,
        user: {
          user_id: '',
          email: '',
          role: 'client',
          first_name: '',
          last_name: '',
        },
      })

      // Clear URL params
      navigate('/dashboard', { replace: true })
    }
  }, [accessTokenParam, refreshTokenParam, setupComplete, setAuth, navigate])

  // Handle URL errors from OAuth flow
  useEffect(() => {
    if (urlError) {
      const errorMessages: Record<string, string> = {
        invalid_token: 'This link has expired or is invalid. If you already created your account, please log in.',
        oauth_failed: 'OAuth authentication failed. Please try again.',
        oauth_exchange_failed: 'Failed to complete authentication. Please try again.',
        invalid_state: 'Invalid authentication state. Please start over.',
        email_mismatch: urlErrorDetail || 'Please use the email you signed up with.',
        account_creation_failed: 'Failed to create account. Please contact support.',
        oauth_config_error: 'Authentication service not configured. Please contact support.',
      }

      setError(errorMessages[urlError] || 'An error occurred. Please try again.')
    }
  }, [urlError, urlErrorDetail])

  // Validate token on mount
  useEffect(() => {
    if (!token) {
      setError('No setup token provided. Please use the link from your signup confirmation.')
      return
    }

    const validateToken = async () => {
      setIsValidating(true)
      setError('')

      try {
        const response = await fetch(`${API_URL}/api/auth/setup-account/validate-token`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ token }),
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.detail || 'Invalid or expired token')
        }

        const data = await response.json()
        setTokenData({
          email: data.email,
          first_name: data.first_name,
          last_name: data.last_name,
        })
        setTokenValid(true)
      } catch (err: any) {
        setError(err.message || 'Invalid or expired token')
        setTokenValid(false)
      } finally {
        setIsValidating(false)
      }
    }

    validateToken()
  }, [token])

  // Check password strength
  useEffect(() => {
    setPasswordStrength({
      hasLength: password.length >= 8,
      hasNumber: /\d/.test(password),
      hasUpper: /[A-Z]/.test(password),
      hasLower: /[a-z]/.test(password),
    })
  }, [password])

  const handleGoogleSignIn = () => {
    window.location.href = `${API_URL}/api/auth/setup-account/oauth/google?token=${token}`
  }

  const handleMicrosoftSignIn = () => {
    window.location.href = `${API_URL}/api/auth/setup-account/oauth/microsoft?token=${token}`
  }

  const handleCreatePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (!Object.values(passwordStrength).every(Boolean)) {
      setError('Password does not meet requirements')
      return
    }

    setIsCreating(true)

    try {
      const response = await fetch(`${API_URL}/api/auth/setup-account/create-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token,
          password,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || 'Failed to create account')
      }

      const data = await response.json()

      // Save auth data
      setAuth({
        access_token: data.access_token,
        refresh_token: data.refresh_token,
        user: data.user,
      })

      // Redirect to dashboard
      navigate('/dashboard', { replace: true })
    } catch (err: any) {
      setError(err.message || 'Failed to create account')
    } finally {
      setIsCreating(false)
    }
  }

  const passwordStrengthMet = Object.values(passwordStrength).every(Boolean)

  if (isValidating) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
            <p className="text-muted-foreground">Validating your setup link...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error && !tokenValid) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertCircle className="h-5 w-5" />
              Link Expired or Invalid
            </CardTitle>
            <CardDescription>
              This setup link has expired or is invalid.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>

            <div className="space-y-2 text-sm">
              <p>If you already created your account:</p>
              <Link to="/login">
                <Button variant="outline" className="w-full">
                  Log in here
                </Button>
              </Link>

              <p className="text-muted-foreground pt-4">
                If you haven't created your account yet, please contact support for assistance.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!tokenValid || !tokenData) {
    return null
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">
            Welcome to Ariel! 🎉
          </CardTitle>
          <CardDescription className="text-center">
            Hi {tokenData.first_name}, create your account to access your AI agent
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {!showPasswordForm ? (
            <>
              {/* Email display */}
              <div className="space-y-2">
                <Label>Email</Label>
                <Input
                  type="email"
                  value={tokenData.email}
                  disabled
                  className="bg-muted"
                />
              </div>

              {/* OAuth options */}
              <div className="space-y-3">
                <Button
                  onClick={handleGoogleSignIn}
                  variant="outline"
                  className="w-full"
                  size="lg"
                >
                  <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="currentColor"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  Continue with Google
                </Button>

                <Button
                  onClick={handleMicrosoftSignIn}
                  variant="outline"
                  className="w-full"
                  size="lg"
                >
                  <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24">
                    <path fill="#f25022" d="M1 1h10v10H1z" />
                    <path fill="#00a4ef" d="M1 13h10v10H1z" />
                    <path fill="#7fba00" d="M13 1h10v10H13z" />
                    <path fill="#ffb900" d="M13 13h10v10H13z" />
                  </svg>
                  Continue with Microsoft
                </Button>
              </div>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <Separator />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">Or</span>
                </div>
              </div>

              <Button
                onClick={() => setShowPasswordForm(true)}
                variant="outline"
                className="w-full"
              >
                Create password instead
              </Button>
            </>
          ) : (
            <>
              {/* Password form */}
              <form onSubmit={handleCreatePassword} className="space-y-4">
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input
                    type="email"
                    value={tokenData.email}
                    disabled
                    className="bg-muted"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Create a password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={isCreating}
                  />
                  <div className="text-xs space-y-1 mt-2">
                    <div className={`flex items-center gap-1 ${passwordStrength.hasLength ? 'text-green-600' : 'text-muted-foreground'}`}>
                      <CheckCircle2 className="h-3 w-3" />
                      At least 8 characters
                    </div>
                    <div className={`flex items-center gap-1 ${passwordStrength.hasUpper ? 'text-green-600' : 'text-muted-foreground'}`}>
                      <CheckCircle2 className="h-3 w-3" />
                      One uppercase letter
                    </div>
                    <div className={`flex items-center gap-1 ${passwordStrength.hasLower ? 'text-green-600' : 'text-muted-foreground'}`}>
                      <CheckCircle2 className="h-3 w-3" />
                      One lowercase letter
                    </div>
                    <div className={`flex items-center gap-1 ${passwordStrength.hasNumber ? 'text-green-600' : 'text-muted-foreground'}`}>
                      <CheckCircle2 className="h-3 w-3" />
                      One number
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="Confirm your password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    disabled={isCreating}
                  />
                </div>

                <div className="flex gap-2">
                  <Button
                    type="button"
                    onClick={() => {
                      setShowPasswordForm(false)
                      setPassword('')
                      setConfirmPassword('')
                      setError('')
                    }}
                    variant="outline"
                    className="flex-1"
                    disabled={isCreating}
                  >
                    Back
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1"
                    disabled={isCreating || !passwordStrengthMet || password !== confirmPassword}
                  >
                    {isCreating ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating account...
                      </>
                    ) : (
                      'Create account'
                    )}
                  </Button>
                </div>
              </form>
            </>
          )}

          <div className="text-center text-xs text-muted-foreground pt-4">
            Already have an account?{' '}
            <Link to="/login" className="text-primary hover:underline font-medium">
              Log in
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
