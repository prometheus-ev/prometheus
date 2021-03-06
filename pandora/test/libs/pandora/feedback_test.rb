require 'test_helper'

class Pandora::FeedbackTest < ActiveSupport::TestCase
  test 'validators' do
    signup = Pandora::Feedback.new(
      name: 'Paul'
    )
    assert_not signup.valid?
    assert_includes signup.errors[:base], 'Your email was empty...'

    signup.email = 'not an email'
    assert_not signup.valid?
    assert_includes signup.errors[:base], 'Your message was empty...'
  end
end