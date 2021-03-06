module Util

  module ActiveMailer

    def remote_ip
      (r = mailer_request) ? r.remote_ip : %x{hostname -i}.chomp
    end

    # REWRITE: this is not needed anymore, rails does it the right way now
    # def url_for(options)
    #   if options.is_a?(Hash)
    #     default = { :only_path => false }

    #     r = mailer_request
    #     default[:host] = r.host_with_port + r.relative_url_root if r

    #     options = options.reverse_merge(default)
    #   end

    #   super
    # end

    def short_url_for(options)
      ShortUrl.link_for(self, options)
    end

    def url_with_short_for(options)
      [url_for(options), short_url_for(options)]
    end

    ###########################################################################
    private
    ###########################################################################

    def mailer_request
      Thread.current[:request]
    end

    def magic_for(action, timestamp, token, options = {})
      link, short_link = url_with_short_for(options.merge(
        :controller => 'accounts',
        :action     => action,
        :timestamp  => timestamp,
        :token      => token
      ))

      { :link => link, :short_link => short_link, :expires => Time.at(timestamp.to_i).to_s }
    end

    def confirmation_for(what, user, timestamp, token)
      magic_for("confirm_#{what}", timestamp, token, :id => user.id)
    end

    def localized_or_combined(locale, multi_line = false)
      Locale.set(DEFAULT_LOCALE) unless Locale.active?

      if locale
        Locale.switch_locale(locale) { yield }
      else
        ORDERED_LANGUAGES.map { |lang|
          Locale.switch_locale(lang) { yield }
        }.reject(&:blank?).join(multi_line ? "\n\n#{'-' * 68}\n\n" : ' / ')
      end
    end

    # REWRITE: we set this in a before action now on every request and within
    # testing, its set within the test setup (if necessary)
    # def self.included(base)
    #   base.default_url_options[:host] = HOST_WITH_PORT
    #   base.default_url_options[:protocol] = HTTP_S_SCHEME
    # end

  end

end
