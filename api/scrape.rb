
require 'neo4j-core'
require 'selenium-webdriver'

session = Neo4j::Session.open(:server_db, ENV['NEO4J_URL'] || 'http://localhost:7474/')

browser = Selenium::WebDriver.for :firefox

begin
  session.query.match(gist: :Gist).where(gist: {poster_image: nil}).pluck('ID(gist)', 'gist.tagline').each do |id, url|
    browser.navigate.to(url)

    begin
      wait = Selenium::WebDriver::Wait.new(:timeout => 10)
      begin
        wait.until do
          begin
            !browser.find_element(:css, 'div#content img').attribute('src').match(/loading\.gif$/)
          rescue Selenium::WebDriver::Error::NoSuchElementError
            browser.find_element(:css, 'div#content div.alert') rescue nil
          end
        end
        
        if image = browser.find_element(:css, 'div#content img')
          image_src = image.attribute('src')
          
          puts "#{url}: Setting poster_image: #{image_src}"
          session.query.match(gist: :Gist).where(gist: {neo_id: id}).set(gist: {poster_image: image_src}).exec if image_src
        end
      rescue Selenium::WebDriver::Error::TimeOutError
        puts "#{url}: Couldn't find element"
      end
    rescue Selenium::WebDriver::Error::NoSuchElementError
      puts "#{url}: Couldn't find element"
    end
  end
ensure
  browser.close
end
